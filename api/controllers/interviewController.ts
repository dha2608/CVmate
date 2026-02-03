import { Response, NextFunction } from 'express';
import { HfInference } from '@huggingface/inference';
import Interview from '../models/Interview.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import logger from '../utils/logger.js';

const getHFClient = () => {
  const apiKey = process.env.HF_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new HfInference(apiKey);
};

const PERSONA_CONFIG = {
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
  },
  'tech-lead': {
    prompt: "You are a Senior Tech Lead named David. You conduct deep technical interviews focusing on system design, architecture patterns, scalability, and problem-solving. Ask challenging questions about distributed systems, algorithms, and real-world technical scenarios. Be thorough and expect detailed answers.",
    firstMessage: "Hi, I'm David, Senior Tech Lead. I'll be conducting a technical deep-dive today. Let's start with system design: How would you architect a system that needs to handle 10 million concurrent users?"
  },
  'startup-founder': {
    prompt: "You are a startup founder named Emma. You value speed, adaptability, and entrepreneurial thinking. Ask questions about handling ambiguity, rapid decision-making, wearing multiple hats, and startup culture. Be energetic and fast-paced.",
    firstMessage: "Hey! I'm Emma, founder of a fast-growing startup. In our world, things change daily. Tell me about a time you had to pivot quickly or adapt to a completely new situation with limited resources."
  },
  'executive': {
    prompt: "You are a C-Level Executive named Robert. You focus on strategic thinking, leadership, business impact, and decision-making at scale. Ask about vision, handling complex organizational challenges, and driving business results. Be professional and expect high-level strategic answers.",
    firstMessage: "Good morning. I'm Robert, the CEO. I'm looking for leaders who can drive impact. Walk me through a strategic decision you made that significantly affected your organization's bottom line."
  },
  'academic': {
    prompt: "You are an Academic Researcher named Dr. Chen. You conduct interviews for research positions and PhD programs. Focus on theoretical knowledge, research methodology, publications, and academic rigor. Ask about research experience, publications, and theoretical frameworks.",
    firstMessage: "Hello, I'm Dr. Chen. I'm evaluating candidates for our research team. Could you tell me about your research background and the most significant contribution you've made to your field?"
  }
};

type PersonaType = keyof typeof PERSONA_CONFIG;

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
      status: 'active'
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

    const interview = await Interview.findById(id);

    if (!interview) {
      res.status(404).json({ success: false, message: 'Interview session not found' });
      return;
    }

    if (interview.user.toString() !== req.user?._id.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    if (interview.status === 'completed') {
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
        messages: historyForAI,
        max_tokens: 512,
        temperature: 0.7,
      });

      const aiResponse =
        completion.choices?.[0]?.message?.content ||
        "I'm sorry, I didn't catch that.";

      interview.chatHistory.push({
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      });

      await interview.save();
      res.json({ success: true, data: interview });

    } catch (aiError: unknown) {
      const error = aiError instanceof Error ? aiError : new Error(String(aiError));
      logger.error('AI Error in interview chat', error, {
        interviewId: id,
        userId: req.user?._id,
      });
      
      // Parse AI provider error response
      const errorObj = aiError as any;
      let errorMessage = 'AI interview service is currently unavailable.';
      let statusCode = 503;
      
      // Generic handling for AI provider errors
      const errorMsg = errorObj.message || '';
      const errorMsgLower = errorMsg.toLowerCase();
      
      if (errorObj.status === 401 || errorObj.statusCode === 401) {
        errorMessage = 'AI API key is invalid or missing. Please check HF_API_KEY in your .env file.';
        statusCode = 503;
      } else if (errorObj.status === 429 || errorObj.statusCode === 429) {
        errorMessage = 'AI API rate limit exceeded. Please wait a few minutes and try again.';
        statusCode = 429;
      } else if (errorObj.status === 402 || errorObj.statusCode === 402) {
        errorMessage = 'AI provider requires payment or has insufficient credits. Please check your Hugging Face billing or quota.';
        statusCode = 402;
      } else if (errorMsgLower.includes('api key') || errorMsgLower.includes('invalid api key')) {
        errorMessage = 'AI API key is invalid or missing. Please check HF_API_KEY in your .env file.';
        statusCode = 503;
      } else if (errorMsgLower.includes('rate_limit') || errorMsgLower.includes('rate limit')) {
        errorMessage = 'AI API rate limit exceeded. Please wait a few minutes and try again.';
        statusCode = 429;
      } else if (errorMsgLower.includes('quota') || errorMsgLower.includes('billing')) {
        errorMessage = 'AI API quota exceeded. Please check your provider account limits.';
        statusCode = 429;
      } else if (errorObj.message) {
        errorMessage = `AI API error: ${errorObj.message}`;
      }

      res.status(statusCode).json({ 
        success: false, 
        message: errorMessage,
        error: error.message || 'AI API error',
        errorCode: errorObj.status || errorObj.statusCode || 'UNKNOWN',
        type: 'ai_api_error' // Distinguish from server rate limit
      });
    }

  } catch (error) {
    next(error);
  }
};

export const endInterview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const interview = await Interview.findById(id);

    if (!interview) {
      res.status(404).json({ success: false, message: 'Interview not found' });
      return;
    }

    if (interview.user.toString() !== req.user?._id.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    if (interview.status === 'completed' && interview.feedback?.suggestions) {
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
      1. "score" (number 0-100)
      2. "strengths" (array of strings)
      3. "improvements" (array of strings)
      4. "summary" (short paragraph)
      
      Conversation:
      ${conversationText}
    `;

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
          { role: 'user', content: feedbackPrompt },
        ],
        max_tokens: 512,
        temperature: 0.2,
      });

      const responseContent = completion.choices?.[0]?.message?.content;
      if (!responseContent) {
        throw new Error('No response from OpenAI');
      }

      const aiData = JSON.parse(responseContent);

      interview.feedback = {
        confidenceScore: aiData.score || 0,
        contentScore: aiData.score || 0,
        suggestions: `SUMMARY: ${aiData.summary || 'No summary available'}\n\nSTRENGTHS:\n- ${(aiData.strengths || []).join('\n- ') || 'None identified'}\n\nIMPROVEMENTS:\n- ${(aiData.improvements || []).join('\n- ') || 'None identified'}`
      };
      
      interview.status = 'completed';
      await interview.save();

      res.json({ success: true, data: interview });

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('Feedback generation error', err, {
        interviewId: id,
        userId: req.user?._id,
      });
      
      let errorMessage = 'Feedback generation service is currently unavailable.';
      const errorObj = error as { status?: number; message?: string };
      if (errorObj.status === 401) {
        errorMessage = 'AI API key is invalid or missing. Please check HF_API_KEY in your .env file.';
      } else if (errorObj.status === 429) {
        errorMessage = 'AI API rate limit exceeded. Please try again later.';
      } else if (errorObj.message?.toLowerCase().includes('api key')) {
        errorMessage = 'AI API key is invalid or missing.';
      }

      const errorMsg = error instanceof Error ? error.message : String(error);
      res.status(503).json({ 
        success: false, 
        message: errorMessage,
        error: errorMsg || 'AI API error'
      });
    }

  } catch (error) {
    next(error);
  }
};

export const getInterviews = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const interviews = await Interview.find({ user: req.user?._id })
      .select('persona feedback status createdAt updatedAt')
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

    if (interview.user.toString() !== req.user?._id.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    res.json({ success: true, data: interview });
  } catch (error) {
    next(error);
  }
};