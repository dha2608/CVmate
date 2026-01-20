import { Request, Response, NextFunction } from 'express';
import Resume from '../models/Resume.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const createResume = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const resume = await Resume.create({
      user: req.user._id,
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
    const resumes = await Resume.find({ user: req.user._id }).sort({ updatedAt: -1 });
    res.json({ success: true, data: resumes });
  } catch (error) {
    next(error);
  }
};

export const getResumeById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (resume && resume.user.toString() === req.user._id.toString()) {
      res.json({ success: true, data: resume });
    } else {
      res.status(404).json({ success: false, message: 'Resume not found' });
    }
  } catch (error) {
    next(error);
  }
};

export const updateResume = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (resume && resume.user.toString() === req.user._id.toString()) {
      const updatedResume = await Resume.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json({ success: true, data: updatedResume });
    } else {
      res.status(404).json({ success: false, message: 'Resume not found' });
    }
  } catch (error) {
    next(error);
  }
};

export const deleteResume = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (resume && resume.user.toString() === req.user._id.toString()) {
      await resume.deleteOne();
      res.json({ success: true, message: 'Resume removed' });
    } else {
      res.status(404).json({ success: false, message: 'Resume not found' });
    }
  } catch (error) {
    next(error);
  }
};

export const aiEnhance = async (req: Request, res: Response, next: NextFunction) => {
  const { text, type } = req.body; // type: 'experience', 'summary'
  try {
    if (!text) {
      res.status(400).json({ success: false, message: 'Text is required' });
      return;
    }

    const prompt = `Enhance the following ${type || 'text'} for a professional resume. Make it achievement-oriented, use action verbs, and quantify results where possible. Keep it concise.
    
    Original Text: "${text}"
    
    Enhanced Text:`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
    });

    const enhancedText = completion.choices[0].message.content;

    res.json({ success: true, data: enhancedText });
  } catch (error) {
    console.error('AI Enhance Error:', error);
    // Return mock data if API key fails or quota exceeded for demo purposes
    if (process.env.NODE_ENV === 'development' || (error as any).status === 401) {
         res.json({ success: true, data: `[AI Enhanced] ${text} (Mock Response: API Key invalid or quota exceeded)` });
         return;
    }
    next(error);
  }
};
