import { Request, Response, NextFunction } from 'express';
import Interview from '../models/Interview.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const PERSONA_PROMPTS: any = {
  'friendly-hr': "You are a friendly HR recruiter. Ask questions about culture fit, strengths, and weaknesses. Be encouraging and polite.",
  'strict-manager': "You are a strict hiring manager. Ask technical questions and case studies. Be concise, direct, and challenge the candidate's answers.",
  'english-native': "You are an English native speaker conducting a language proficiency interview. Focus on grammar, vocabulary, and fluency. Correct mistakes politely."
};

export const startInterview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { persona } = req.body;
    
    if (!PERSONA_PROMPTS[persona]) {
      res.status(400).json({ success: false, message: 'Invalid persona' });
      return;
    }

    const interview = await Interview.create({
      user: req.user._id,
      persona,
      chatHistory: [{
        role: 'system',
        content: PERSONA_PROMPTS[persona]
      }]
    });

    // Initial greeting from AI
    try {
        const completion = await openai.chat.completions.create({
          messages: [{ role: "system", content: PERSONA_PROMPTS[persona] }, { role: "user", content: "Start the interview." }],
          model: "gpt-3.5-turbo",
        });

        const aiMessage = completion.choices[0].message.content;
        interview.chatHistory.push({ role: 'assistant', content: aiMessage || 'Hello, ready to start?' });
    } catch (e) {
        console.error('OpenAI Error', e);
        interview.chatHistory.push({ role: 'assistant', content: 'Hello! I am ready to interview you. (AI Connection Failed - Mock Mode)' });
    }
    
    await interview.save();

    res.status(201).json({ success: true, data: interview });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { message } = req.body;
    const interview = await Interview.findById(req.params.id);

    if (!interview || interview.user.toString() !== req.user._id.toString()) {
      res.status(404).json({ success: false, message: 'Interview not found' });
      return;
    }

    interview.chatHistory.push({ role: 'user', content: message });

    // Prepare history for OpenAI
    const messages = interview.chatHistory.map((msg: any) => ({
      role: msg.role,
      content: msg.content
    }));

    try {
        const completion = await openai.chat.completions.create({
          messages: messages,
          model: "gpt-3.5-turbo",
        });

        const aiResponse = completion.choices[0].message.content;
        interview.chatHistory.push({ role: 'assistant', content: aiResponse || '...' });
    } catch (e) {
        console.error('OpenAI Error', e);
         interview.chatHistory.push({ role: 'assistant', content: `(Mock Response) That's interesting. Tell me more about "${message}".` });
    }
    
    await interview.save();

    res.json({ success: true, data: interview });
  } catch (error) {
    next(error);
  }
};

export const getInterviews = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const interviews = await Interview.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: interviews });
  } catch (error) {
    next(error);
  }
};
