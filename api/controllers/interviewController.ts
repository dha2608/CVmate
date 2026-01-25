import { Request, Response, NextFunction } from 'express';
import OpenAI from 'openai';
import { Document, Types } from 'mongoose';
import Interview from '../models/Interview.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type PersonaType = 'friendly-hr' | 'strict-manager' | 'english-native';

interface IInterview extends Document {
  user: Types.ObjectId;
  persona: string;
  chatHistory: Array<{
    role: string;
    content: string;
    timestamp: Date;
  }>;
  isCompleted: boolean;
  feedback?: {
    score: number;
    strengths: string[];
    improvements: string[];
    summary: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const PERSONA_CONFIG: Record<PersonaType, { prompt: string; firstMessage: string }> = {
  'friendly-hr': {
    prompt: "You are a friendly HR recruiter named Sarah. Your goal is to assess culture fit and soft skills. Be warm, encouraging, and polite. Ask one question at a time. Keep responses concise.",
    firstMessage: "Hi there! I'm Sarah from HR. Thanks for joining me today. To start, could you tell me a little bit about yourself and what brings you here?"
  },
  'strict-manager': {
    prompt: "You are a strict Senior Tech Lead named Mike. You value efficiency and technical accuracy. Ask challenging technical questions and scenarios. If an answer is vague, drill down. Be direct and professional.",
    firstMessage: "I'm Mike, the Tech Lead. I've reviewed your CV. Let's get straight to the point. Describe the most complex technical challenge you've faced recently and how you solved it."
  },
  'english-native': {
    prompt: "You are an English teacher named Alex. You are conducting a proficiency test. Focus on the user's grammar, vocabulary, and fluency. If they make a mistake, politely correct them in your next response. Keep the conversation flowing naturally.",
    firstMessage: "Hello! I'm Alex. We're going to have a casual conversation to practice your English. How has your day been so far?"
  }
};

export const startInterview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { persona } = req.body as { persona: PersonaType };

    if (!PERSONA_CONFIG[persona]) {
      res.status(400).json({ success: false, message: 'Invalid persona selected' });
      return;
    }

    const initialMessage = PERSONA_CONFIG[persona].firstMessage;

    const interview = await Interview.create({
      user: req.user?._id,
      persona,
      chatHistory: [
        {
          role: 'system',
          content: PERSONA_CONFIG[persona].prompt,
          timestamp: new Date()
        },
        {
          role: 'assistant',
          content: initialMessage,
          timestamp: new Date()
        }
      ],
      isCompleted: false
    });

    res.status(201).json({ success: true, data: interview });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { message } = req.body;
    const { id } = req.params;

    const interview = (await Interview.findById(id)) as unknown as IInterview;

    if (!interview) {
      res.status(404).json({ success: false, message: 'Interview session not found' });
      return;
    }

    if (interview.user.toString() !== req.user?._id.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    if (interview.isCompleted) {
      res.status(400).json({ success: false, message: 'This interview has already ended.' });
      return;
    }

    interview.chatHistory.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    const historyForAI = [
      interview.chatHistory[0],
      ...interview.chatHistory.slice(-10)
    ].map(msg => ({
      role: msg.role as 'system' | 'user' | 'assistant',
      content: msg.content
    }));

    try {
      const completion = await openai.chat.completions.create({
        messages: historyForAI,
        model: "gpt-3.5-turbo",
        temperature: 0.7,
      });

      const aiResponse = completion.choices[0].message.content || "I'm sorry, I didn't catch that. Could you repeat?";

      interview.chatHistory.push({
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      });

      await interview.save();
      res.json({ success: true, data: interview });

    } catch (aiError) {
      console.error(aiError);
      res.status(503).json({ success: false, message: 'AI service is temporarily unavailable. Please try again.' });
    }

  } catch (error) {
    next(error);
  }
};

export const endInterview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const interview = (await Interview.findById(id)) as unknown as IInterview;

    if (!interview) {
      res.status(404).json({ success: false, message: 'Interview not found' });
      return;
    }

    if (interview.user.toString() !== req.user?._id.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    if (interview.isCompleted && interview.feedback?.summary) {
      res.json({ success: true, data: interview });
      return;
    }

    const conversationText = interview.chatHistory
      .filter(msg => msg.role !== 'system')
      .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
      .join('\n');

    const feedbackPrompt = `
      Analyze the following interview conversation based on the persona "${interview.persona}".
      Provide a JSON response with:
      1. "score" (number 0-100 based on quality of answers)
      2. "strengths" (array of strings)
      3. "improvements" (array of strings)
      4. "summary" (short paragraph feedback)
      
      Conversation:
      ${conversationText}
    `;

    try {
      const completion = await openai.chat.completions.create({
        messages: [{ role: 'user', content: feedbackPrompt }],
        model: 'gpt-3.5-turbo',
        response_format: { type: 'json_object' },
      });

      const feedbackData = JSON.parse(completion.choices[0].message.content || '{}');

      interview.feedback = {
        score: feedbackData.score || 0,
        strengths: feedbackData.strengths || [],
        improvements: feedbackData.improvements || [],
        summary: feedbackData.summary || 'No feedback generated.'
      };
      interview.isCompleted = true;
      
      await interview.save();

      res.json({ success: true, data: interview });

    } catch (error) {
      console.error(error);
      interview.isCompleted = true;
      interview.feedback = {
        score: 0,
        strengths: [],
        improvements: [],
        summary: "Feedback generation failed due to service error."
      };
      await interview.save();
      res.json({ success: true, data: interview });
    }

  } catch (error) {
    next(error);
  }
};

export const getInterviews = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const interviews = await Interview.find({ user: req.user?._id })
      .select('persona feedback.score isCompleted createdAt updatedAt')
      .sort({ createdAt: -1 });
      
    res.json({ success: true, data: interviews });
  } catch (error) {
    next(error);
  }
};

export const getInterviewById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      res.status(404).json({ success: false, message: 'Interview not found' });
      return;
    }

    if (interview.get('user').toString() !== req.user?._id.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    res.json({ success: true, data: interview });
  } catch (error) {
    next(error);
  }
};