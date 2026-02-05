import { Response, NextFunction } from 'express';
import { HfInference } from '@huggingface/inference';
import Resume from '../models/Resume.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import logger from '../utils/logger.js';

const getHFClient = () => {
  const apiKey = process.env.HF_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new HfInference(apiKey);
};

export const createResume = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Sanitize arrays to avoid failing required field validation on empty placeholder items
    const body = req.body || {};
    const experience = Array.isArray(body.experience) ? body.experience : [];
    const education = Array.isArray(body.education) ? body.education : [];
    const skills = Array.isArray(body.skills) ? body.skills : [];

    const cleanedExperience = experience
      .filter((e: any) => e && (String(e.company || '').trim() || String(e.position || '').trim() || String(e.description || '').trim() || String(e.startDate || '').trim() || String(e.endDate || '').trim()))
      .filter((e: any) => String(e.company || '').trim() && String(e.position || '').trim())
      .map((e: any) => ({
        ...e,
        company: String(e.company || '').trim(),
        position: String(e.position || '').trim(),
        startDate: String(e.startDate || '').trim(),
        endDate: String(e.endDate || '').trim(),
        description: String(e.description || ''),
      }));

    const cleanedEducation = education
      .filter((e: any) => e && (String(e.institution || '').trim() || String(e.degree || '').trim() || String(e.description || '').trim() || String(e.startDate || '').trim() || String(e.endDate || '').trim()))
      .filter((e: any) => String(e.institution || '').trim() && String(e.degree || '').trim())
      .map((e: any) => ({
        ...e,
        institution: String(e.institution || '').trim(),
        degree: String(e.degree || '').trim(),
        startDate: String(e.startDate || '').trim(),
        endDate: String(e.endDate || '').trim(),
        description: String(e.description || ''),
      }));

    const cleanedSkills = skills.map((s: any) => String(s).trim()).filter(Boolean);

    // Ensure personalInfo is properly formatted
    const personalInfo = req.body.personalInfo ? {
      fullName: String(req.body.personalInfo.fullName || '').trim(),
      email: String(req.body.personalInfo.email || '').trim(),
      phone: String(req.body.personalInfo.phone || '').trim(),
      address: String(req.body.personalInfo.address || '').trim(),
      linkedin: String(req.body.personalInfo.linkedin || '').trim(),
      website: String(req.body.personalInfo.website || '').trim(),
    } : undefined;

    // Validate required fields
    if (!personalInfo?.fullName || !personalInfo?.email) {
      res.status(400).json({ 
        success: false, 
        message: 'Validation error',
        errors: ['Full name and email are required']
      });
      return;
    }

    const resume = await Resume.create({
      user: req.user?._id,
      title: String(req.body.title || 'Untitled Resume').trim(),
      personalInfo,
      summary: String(req.body.summary || '').trim(),
      experience: cleanedExperience,
      education: cleanedEducation,
      skills: cleanedSkills,
      variantType: req.body.variantType || 'general',
      themeConfig: req.body.themeConfig || {
        color: '#000000',
        font: 'Inter',
        layout: 'standard',
      },
    });
    res.status(201).json({ success: true, data: resume });
  } catch (error: unknown) {
    logger.error('Create Resume Error', error instanceof Error ? error : new Error(String(error)), {
      userId: req.user?._id,
    });
    if (error instanceof Error && error.name === 'ValidationError') {
      const mongooseError = error as { errors?: Record<string, { message: string }> };
      const errors = mongooseError.errors ? Object.values(mongooseError.errors).map((err) => err.message) : [];
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
    // Sanitize arrays to avoid failing required field validation on empty placeholder items
    const body = req.body || {};
    const experience = Array.isArray(body.experience) ? body.experience : [];
    const education = Array.isArray(body.education) ? body.education : [];
    const skills = Array.isArray(body.skills) ? body.skills : [];

    const cleanedExperience = experience
      .filter((e: any) => e && (String(e.company || '').trim() || String(e.position || '').trim() || String(e.description || '').trim() || String(e.startDate || '').trim() || String(e.endDate || '').trim()))
      .filter((e: any) => String(e.company || '').trim() && String(e.position || '').trim())
      .map((e: any) => ({
        ...e,
        company: String(e.company || '').trim(),
        position: String(e.position || '').trim(),
        startDate: String(e.startDate || '').trim(),
        endDate: String(e.endDate || '').trim(),
        description: String(e.description || ''),
      }));

    const cleanedEducation = education
      .filter((e: any) => e && (String(e.institution || '').trim() || String(e.degree || '').trim() || String(e.description || '').trim() || String(e.startDate || '').trim() || String(e.endDate || '').trim()))
      .filter((e: any) => String(e.institution || '').trim() && String(e.degree || '').trim())
      .map((e: any) => ({
        ...e,
        institution: String(e.institution || '').trim(),
        degree: String(e.degree || '').trim(),
        startDate: String(e.startDate || '').trim(),
        endDate: String(e.endDate || '').trim(),
        description: String(e.description || ''),
      }));

    const cleanedSkills = skills.map((s: any) => String(s).trim()).filter(Boolean);

    const updateData = {
      ...body,
      experience: cleanedExperience,
      education: cleanedEducation,
      skills: cleanedSkills,
      // Ensure personalInfo fields are trimmed
      personalInfo: body.personalInfo ? {
        fullName: String(body.personalInfo.fullName || '').trim(),
        email: String(body.personalInfo.email || '').trim(),
        phone: String(body.personalInfo.phone || '').trim(),
        address: String(body.personalInfo.address || '').trim(),
        linkedin: String(body.personalInfo.linkedin || '').trim(),
        website: String(body.personalInfo.website || '').trim(),
      } : undefined,
    };

    const updatedResume = await Resume.findOneAndUpdate(
      { _id: req.params.id, user: req.user?._id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedResume) {
      res.status(404).json({ success: false, message: 'Resume not found' });
      return;
    }

    res.json({ success: true, data: updatedResume });
  } catch (error: unknown) {
    logger.error('Update Resume Error', error instanceof Error ? error : new Error(String(error)), {
      userId: req.user?._id,
      resumeId: req.params.id,
    });
    if (error instanceof Error && error.name === 'ValidationError') {
      const mongooseError = error as { errors?: Record<string, { message: string }> };
      const errors = mongooseError.errors ? Object.values(mongooseError.errors).map((err) => err.message) : [];
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

    const hf = getHFClient();
    if (!hf) {
      res.status(503).json({ 
        success: false, 
        message: 'AI provider API key is not configured. Please set HF_API_KEY in your environment variables.',
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
      const completion = await hf.chatCompletion({
        model: process.env.HF_CHAT_MODEL || 'meta-llama/Meta-Llama-3-8B-Instruct',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 256,
        temperature: 0.7,
      });

      const enhancedText = completion.choices?.[0]?.message?.content;
      if (!enhancedText) {
        throw new Error('No response from OpenAI');
      }

      res.json({ success: true, data: enhancedText });

    } catch (apiError: unknown) {
      const error = apiError instanceof Error ? apiError : new Error(String(apiError));
      logger.error('AI Error in AI Enhance', error, {
        userId: req.user?._id,
        type,
      });
      
      let errorMessage = 'AI service is currently unavailable.';
      const errorObj = apiError as { status?: number; statusCode?: number; message?: string };
      const errorMsg = errorObj.message || '';
      const errorMsgLower = errorMsg.toLowerCase();
      
      if (errorObj.status === 401 || errorObj.statusCode === 401) {
        errorMessage = 'AI API key is invalid or missing. Please check HF_API_KEY in your .env file.';
      } else if (errorObj.status === 429 || errorObj.statusCode === 429) {
        errorMessage = 'AI API rate limit exceeded. Please try again later.';
      } else if (errorMsgLower.includes('api key') || errorMsgLower.includes('invalid api key')) {
        errorMessage = 'AI API key is invalid or missing. Please check HF_API_KEY in your .env file.';
      } else if (errorMsgLower.includes('quota') || errorMsgLower.includes('billing')) {
        errorMessage = 'AI API quota exceeded. Please check your provider account limits.';
      }

      res.status(503).json({ 
        success: false, 
        message: errorMessage,
        error: error.message || 'AI API error'
      });
    }
  } catch (error) {
    next(error);
  }
};

export const analyzeResume = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { jobDescription } = req.body;
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

    const hf = getHFClient();
    if (!hf) {
      res.status(503).json({ 
        success: false, 
        message: 'AI provider API key is not configured. Please set HF_API_KEY in your environment variables.',
      });
      return;
    }

    try {
      const completion = await hf.chatCompletion({
        model: process.env.HF_CHAT_MODEL || 'meta-llama/Meta-Llama-3-8B-Instruct',
        messages: [
          {
            role: 'system',
            content:
              'You are an AI assistant that only responds with a valid JSON object and no other text.',
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 512,
        temperature: 0.2,
      });

      const responseContent = completion.choices?.[0]?.message?.content;
      if (!responseContent) {
        throw new Error('No response from OpenAI');
      }

      const analysis = JSON.parse(responseContent);
      
      resume.atsScore = analysis.score || 0;
      await resume.save();

      res.json({ success: true, data: analysis });

    } catch (e: unknown) {
      const error = e instanceof Error ? e : new Error(String(e));
      logger.error('AI Analysis Error', error, {
        resumeId: req.params.id,
        userId: req.user?._id,
      });
      
      let errorMessage = 'ATS analysis service is currently unavailable.';
      const errorObj = e as { status?: number; statusCode?: number; message?: string };
      const errorMsg = errorObj.message || '';
      const errorMsgLower = errorMsg.toLowerCase();
      
      if (errorObj.status === 401 || errorObj.statusCode === 401) {
        errorMessage = 'AI API key is invalid or missing. Please check HF_API_KEY in your .env file.';
      } else if (errorObj.status === 429 || errorObj.statusCode === 429) {
        errorMessage = 'AI API rate limit exceeded. Please try again later.';
      } else if (errorMsgLower.includes('api key') || errorMsgLower.includes('invalid api key')) {
        errorMessage = 'AI API key is invalid or missing. Please check HF_API_KEY in your .env file.';
      } else if (errorMsgLower.includes('quota') || errorMsgLower.includes('billing')) {
        errorMessage = 'AI API quota exceeded. Please check your provider account limits.';
      }

      res.status(503).json({ 
        success: false, 
        message: errorMessage,
        error: error.message || 'AI API error'
      });
    }

  } catch (error) {
    next(error);
  }
};

export const aiGenerateFullResume = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { prompt, jobDescription } = req.body as { prompt?: string; jobDescription?: string };

    if (!prompt && !jobDescription) {
      res.status(400).json({
        success: false,
        message: 'Prompt or job description is required',
      });
      return;
    }

    const hf = getHFClient();
    if (!hf) {
      res.status(503).json({
        success: false,
        message: 'AI provider API key is not configured. Please set HF_API_KEY in your environment variables.',
      });
      return;
    }

    const basePrompt = `
      You are an expert resume writer.
      Generate a JSON object for a professional resume based on the information below.
      
      The JSON MUST have exactly this structure:
      {
        "summary": "string, 2-4 sentences professional summary",
        "experience": [
          {
            "company": "string",
            "position": "string",
            "startDate": "YYYY-MM",
            "endDate": "YYYY-MM or Present",
            "description": "multi-line bullet-style description"
          }
        ],
        "education": [
          {
            "institution": "string",
            "degree": "string",
            "startDate": "YYYY-MM",
            "endDate": "YYYY-MM or Present",
            "description": "short description of achievements"
          }
        ],
        "skills": ["string", "string", "..."]
      }

      User prompt (career background / profile):
      ${prompt || 'N/A'}
      
      Job description (if provided, align resume to this role):
      ${jobDescription || 'N/A'}
    `;

    try {
      const completion = await hf.chatCompletion({
        model: process.env.HF_CHAT_MODEL || 'meta-llama/Meta-Llama-3-8B-Instruct',
        messages: [
          {
            role: 'system',
            content:
              'You are an AI assistant that only responds with a valid JSON object and no other text.',
          },
          { role: 'user', content: basePrompt },
        ],
        max_tokens: 768,
        temperature: 0.4,
      });

      const responseContent = completion.choices?.[0]?.message?.content;
      if (!responseContent) {
        throw new Error('No response from AI provider');
      }

      const data = JSON.parse(responseContent);

      // Normalize to frontend structure; IDs sẽ được tạo ở client
      const result = {
        summary: typeof data.summary === 'string' ? data.summary : '',
        experience: Array.isArray(data.experience) ? data.experience : [],
        education: Array.isArray(data.education) ? data.education : [],
        skills: Array.isArray(data.skills) ? data.skills : [],
      };

      res.json({ success: true, data: result });
    } catch (e: unknown) {
      const error = e instanceof Error ? e : new Error(String(e));
      logger.error('AI Generate Full Resume Error', error, {
        userId: req.user?._id,
      });

      let errorMessage = 'AI resume generation service is currently unavailable.';
      const errorObj = e as { status?: number; statusCode?: number; message?: string };
      const errorMsg = errorObj.message || '';
      const errorMsgLower = errorMsg.toLowerCase();

      if (errorObj.status === 401 || errorObj.statusCode === 401) {
        errorMessage = 'AI API key is invalid or missing. Please check HF_API_KEY in your .env file.';
      } else if (errorObj.status === 429 || errorObj.statusCode === 429) {
        errorMessage = 'AI API rate limit exceeded. Please try again later.';
      } else if (errorMsgLower.includes('api key') || errorMsgLower.includes('invalid api key')) {
        errorMessage = 'AI API key is invalid or missing. Please check HF_API_KEY in your .env file.';
      } else if (errorMsgLower.includes('quota') || errorMsgLower.includes('billing')) {
        errorMessage = 'AI API quota exceeded. Please check your provider account limits.';
      }

      res.status(503).json({
        success: false,
        message: errorMessage,
        error: error.message || 'AI API error',
      });
    }
  } catch (error) {
    next(error);
  }
};
