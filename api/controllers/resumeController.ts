import { Request, Response, NextFunction } from 'express';
import OpenAI from 'openai';
import Resume from '../models/Resume.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

// Khởi tạo OpenAI client chỉ khi có API key
const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new OpenAI({ apiKey });
};

export const createResume = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const resume = await Resume.create({
      user: req.user?._id,
      title: req.body.title || 'Untitled Resume',
      ...req.body
    });
    res.status(201).json({ success: true, data: resume });
  } catch (error: any) {
    console.error('Create Resume Error:', error);
    // Kiểm tra lỗi validation từ Mongoose
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({ 
        success: false, 
        message: 'Validation error', 
        errors 
      });
      return;
    }
    next(error);
  }
};

export const getResumes = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const resumes = await Resume.find({ user: req.user?._id })
      .select('title personalInfo.fullName updatedAt atsScore isPublic')
      .sort({ updatedAt: -1 });
    res.json({ success: true, data: resumes });
  } catch (error) {
    next(error);
  }
};

export const getResumeById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const resume = await Resume.findOne({ 
      _id: req.params.id, 
      user: req.user?._id 
    });

    if (!resume) {
      res.status(404).json({ success: false, message: 'Resume not found' });
      return;
    }

    res.json({ success: true, data: resume });
  } catch (error) {
    next(error);
  }
};

export const updateResume = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const updatedResume = await Resume.findOneAndUpdate(
      { _id: req.params.id, user: req.user?._id },
      req.body,
      { new: true }
    );

    if (!updatedResume) {
      res.status(404).json({ success: false, message: 'Resume not found' });
      return;
    }

    res.json({ success: true, data: updatedResume });
  } catch (error) {
    next(error);
  }
};

export const deleteResume = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await Resume.findOneAndDelete({ 
      _id: req.params.id, 
      user: req.user?._id 
    });

    if (!result) {
      res.status(404).json({ success: false, message: 'Resume not found' });
      return;
    }

    res.json({ success: true, message: 'Resume removed' });
  } catch (error) {
    next(error);
  }
};

export const aiEnhance = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { text, type } = req.body; 
  
  try {
    if (!text) {
      res.status(400).json({ success: false, message: 'Text is required' });
      return;
    }

    const openai = getOpenAIClient();
    if (!openai) {
      res.status(503).json({ 
        success: false, 
        message: 'OpenAI API key is not configured. Please set OPENAI_API_KEY in your environment variables.',
      });
      return;
    }

    const prompt = `
      Act as a professional resume writer. Enhance the following ${type || 'text'} to be more impactful.
      - Use strong action verbs.
      - Quantify results where possible.
      - Fix grammar and improve flow.
      - Keep it concise and professional.
      
      Original Text: "${text}"
      
      Enhanced Text:
    `;

    try {
      const completion = await openai.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
        temperature: 0.7,
      });

      const enhancedText = completion.choices[0].message.content;
      if (!enhancedText) {
        throw new Error('No response from OpenAI');
      }

      res.json({ success: true, data: enhancedText });

    } catch (apiError: any) {
      console.error('OpenAI Error:', apiError);
      
      // Phân loại lỗi để có message phù hợp
      let errorMessage = 'AI service is currently unavailable.';
      if (apiError.status === 401) {
        errorMessage = 'Invalid OpenAI API key. Please check your API key configuration.';
      } else if (apiError.status === 429) {
        errorMessage = 'OpenAI API rate limit exceeded. Please try again later.';
      } else if (apiError.message?.includes('API key')) {
        errorMessage = 'OpenAI API key is invalid or missing.';
      }

      res.status(503).json({ 
        success: false, 
        message: errorMessage,
        error: apiError.message || 'OpenAI API error'
      });
    }
  } catch (error) {
    next(error);
  }
};

export const analyzeResume = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { jobDescription } = req.body; // Optional JD for comparison
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user?._id });

    if (!resume) {
      res.status(404).json({ success: false, message: 'Resume not found' });
      return;
    }

    const resumeContent = JSON.stringify(resume);
    
    let prompt = `
      Analyze this resume JSON data for ATS (Applicant Tracking System) compatibility and general quality.
      Provide a response in JSON format with:
      1. "score" (0-100)
      2. "strengths" (array of strings)
      3. "improvements" (array of strings)
      4. "summary" (short feedback)
      5. "missingKeywords" (array of strings - if JD provided)
      6. "matchScore" (0-100 - if JD provided)

      Resume Data:
      ${resumeContent.substring(0, 3000)}
    `;

    if (jobDescription) {
      prompt += `\n\nJob Description:\n${jobDescription.substring(0, 2000)}\n\nCompare the resume with the job description. Identify missing keywords and calculate match score.`;
    }

    const openai = getOpenAIClient();
    if (!openai) {
      res.status(503).json({ 
        success: false, 
        message: 'OpenAI API key is not configured. Please set OPENAI_API_KEY in your environment variables.',
      });
      return;
    }

    try {
      const completion = await openai.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
        response_format: { type: "json_object" }
      });

      const responseContent = completion.choices[0].message.content;
      if (!responseContent) {
        throw new Error('No response from OpenAI');
      }

      const analysis = JSON.parse(responseContent);
      
      resume.atsScore = analysis.score || 0;
      await resume.save();

      res.json({ success: true, data: analysis });

    } catch (e: any) {
      console.error('OpenAI Analysis Error:', e);
      
      let errorMessage = 'ATS analysis service is currently unavailable.';
      if (e.status === 401) {
        errorMessage = 'Invalid OpenAI API key. Please check your API key configuration.';
      } else if (e.status === 429) {
        errorMessage = 'OpenAI API rate limit exceeded. Please try again later.';
      } else if (e.message?.includes('API key')) {
        errorMessage = 'OpenAI API key is invalid or missing.';
      }

      res.status(503).json({ 
        success: false, 
        message: errorMessage,
        error: e.message || 'OpenAI API error'
      });
    }

  } catch (error) {
    next(error);
  }
};