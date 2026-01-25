import { Request, Response, NextFunction } from 'express';
import OpenAI from 'openai';
import Resume from '../models/Resume.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const createResume = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const resume = await Resume.create({
      user: req.user?._id,
      title: req.body.title || 'Untitled Resume',
      ...req.body
    });
    res.status(201).json({ success: true, data: resume });
  } catch (error) {
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
        model: "gpt-3.5-turbo",
        temperature: 0.7,
      });

      const enhancedText = completion.choices[0].message.content;
      res.json({ success: true, data: enhancedText });

    } catch (apiError) {
      console.error('OpenAI Error:', apiError);
      res.json({ 
        success: true, 
        data: `(Mock) Enhanced: ${text}. *Successfully demonstrated achievement in optimizing workflow efficiency by 20%.* (AI Service Unavailable)` 
      });
    }
  } catch (error) {
    next(error);
  }
};

export const analyzeResume = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user?._id });

    if (!resume) {
      res.status(404).json({ success: false, message: 'Resume not found' });
      return;
    }

    const resumeContent = JSON.stringify(resume);
    
    const prompt = `
      Analyze this resume JSON data for ATS (Applicant Tracking System) compatibility and general quality.
      Provide a response in JSON format with:
      1. "score" (0-100)
      2. "strengths" (array of strings)
      3. "improvements" (array of strings)
      4. "summary" (short feedback)

      Resume Data:
      ${resumeContent.substring(0, 3000)}
    `;

    try {
      const completion = await openai.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "gpt-3.5-turbo",
        response_format: { type: "json_object" }
      });

      const analysis = JSON.parse(completion.choices[0].message.content || '{}');
      
      resume.atsScore = analysis.score || 0;
      await resume.save();

      res.json({ success: true, data: analysis });

    } catch (e) {
      res.json({ 
        success: true, 
        data: {
          score: 75,
          strengths: ["Good structure", "Clear contact info"],
          improvements: ["Add more keywords", "Quantify achievements"],
          summary: "This is a mock analysis because AI service is unavailable."
        } 
      });
    }

  } catch (error) {
    next(error);
  }
};