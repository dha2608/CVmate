import { Response, NextFunction } from 'express';
import Interview from '../models/Interview.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import logger from '../utils/logger.js';
import { getHFOrThrow, resolveModel, buildCacheKey, getCachedOrRun, logAIUsage } from '../utils/aiClient.js';
import {
  sendSuccessResponse,
  sendErrorResponse,
  handleValidationError,
  handleNotFoundError,
  handleUnauthorizedError,
  handleForbiddenError,
  handleServerError,
  ErrorCode,
} from '../utils/errorHandler.js';
import { checkAndAwardAchievement } from './achievementController.js';

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

    sendSuccessResponse(res, interview, 201);
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

    const model = resolveModel(req, 'chat');
    const startedAt = Date.now();

    try {
      const hf = getHFOrThrow();
      const completion = await hf.chatCompletion({
        model,
        messages: historyForAI,
        max_tokens: 512,
        temperature: 0.65,
      });

      const aiResponse =
        completion.choices?.[0]?.message?.content?.trim() ||
        "I'm sorry, I didn't catch that.";

      interview.chatHistory.push({
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      });

      await interview.save();

      const durationMs = Date.now() - startedAt;
      logAIUsage({
        userId: req.user?._id?.toString(),
        endpoint: '/api/interviews/:id/chat',
        type: 'interview_chat',
        model,
        durationMs,
        success: true,
      });

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

      const durationMs = Date.now() - startedAt;
      logAIUsage({
        userId: req.user?._id?.toString(),
        endpoint: '/api/interviews/:id/chat',
        type: 'interview_chat',
        model,
        durationMs,
        success: false,
        errorCode: errorObj.status || errorObj.statusCode || 'UNKNOWN',
      });

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
You are an expert interview coach.
Analyze the following interview conversation based on the persona "${interview.persona}".

Return ONLY a valid JSON object with this exact structure and no other text:
{
  "scores": {
    "communication": number,   // 0-100
    "content": number,         // 0-100
    "confidence": number,      // 0-100
    "structure": number        // 0-100
  },
  "strengths": string[],        // list of strengths
  "improvements": string[],     // list of concrete, actionable improvements
  "summary": string,            // short paragraph (3-5 sentences) summarizing overall performance
  "perQuestionFeedback": [
    {
      "question": string,       // interviewer question
      "answer": string,         // candidate answer (short summary)
      "score": number,          // 0-100 for this question
      "feedback": string        // 1-3 sentences of targeted feedback
    }
  ]
}

Conversation:
${conversationText}
    `;

    const model = resolveModel(req, 'chat');
    const cacheKey = buildCacheKey('interview_feedback', model, { interviewId: id });
    const startedAt = Date.now();

    try {
      const aiData = await getCachedOrRun(cacheKey, 15 * 60 * 1000, async () => {
        const hf = getHFOrThrow();

      const completion = await hf.chatCompletion({
          model,
        messages: [
          {
            role: 'system',
            content:
                'You are an AI interview coach that only responds with a valid JSON object and no other text.',
          },
          { role: 'user', content: feedbackPrompt },
        ],
        max_tokens: 512,
          temperature: 0.25,
      });

      const responseContent = completion.choices?.[0]?.message?.content;
      if (!responseContent) {
          throw new Error('No response from AI provider');
      }

        return JSON.parse(responseContent);
      });

      const scores = aiData.scores || {};
      const overallScore =
        typeof scores.communication === 'number' ||
        typeof scores.content === 'number' ||
        typeof scores.confidence === 'number' ||
        typeof scores.structure === 'number'
          ? Math.round(
              ([
                scores.communication ?? 0,
                scores.content ?? 0,
                scores.confidence ?? 0,
                scores.structure ?? 0,
              ].reduce((sum: number, v: number) => sum + v, 0)) /
                4,
            )
          : aiData.score || 0;

      const strengths: string[] = Array.isArray(aiData.strengths) ? aiData.strengths : [];
      const improvements: string[] = Array.isArray(aiData.improvements) ? aiData.improvements : [];
      const perQuestionFeedback = Array.isArray(aiData.perQuestionFeedback)
        ? aiData.perQuestionFeedback
        : [];

      interview.feedback = {
        // Backwards-compatible fields for existing UI
        confidenceScore: scores.confidence ?? overallScore ?? 0,
        contentScore: scores.content ?? overallScore ?? 0,
        suggestions: `SUMMARY: ${aiData.summary || 'No summary available'}\n\nSTRENGTHS:\n- ${
          strengths.length ? strengths.join('\n- ') : 'None identified'
        }\n\nIMPROVEMENTS:\n- ${
          improvements.length ? improvements.join('\n- ') : 'None identified'
        }`,
        // New structured data for radar & rich UI
        strengths,
        improvements,
        overallScore: overallScore ?? 0,
        scoresByDimension: {
          communication: scores.communication ?? null,
          content: scores.content ?? null,
          confidence: scores.confidence ?? null,
          structure: scores.structure ?? null,
        },
        perQuestionFeedback,
      };
      
      interview.status = 'completed';
      await interview.save();

      // Check for complete_interview achievement
      const interviewCount = await Interview.countDocuments({ 
        user: req.user?._id, 
        status: 'completed' 
      });
      if (interviewCount === 1) {
        await checkAndAwardAchievement(
          req.user?._id.toString(),
          'complete_interview',
          { interviewId: interview._id.toString() }
        );
      }

      const durationMs = Date.now() - startedAt;
      logAIUsage({
        userId: req.user?._id?.toString(),
        endpoint: '/api/interviews/:id/end',
        type: 'interview_feedback',
        model,
        durationMs,
        success: true,
      });

      res.json({ success: true, data: interview });

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('Feedback generation error', err, {
        interviewId: id,
        userId: req.user?._id,
      });
      
      const errorObj = error as { status?: number; statusCode?: number; message?: string };
      const errorMsg = errorObj.message || '';
      const errorMsgLower = errorMsg.toLowerCase();
      
      let errorMessage = 'Feedback generation service is currently unavailable.';
      let statusCode = 503;
      let shouldFallback = false;
      
      // Determine error type and fallback strategy
      if (errorObj.status === 401 || errorObj.statusCode === 401 || errorMsgLower.includes('api key')) {
        errorMessage = 'AI API key is invalid or missing. Please check HF_API_KEY in your .env file.';
        statusCode = 503;
      } else if (errorObj.status === 429 || errorObj.statusCode === 429 || errorMsgLower.includes('rate limit')) {
        errorMessage = 'AI API rate limit exceeded. Please try again later.';
        statusCode = 429;
        shouldFallback = true; // Can provide basic feedback without AI
      } else if (errorObj.status === 402 || errorObj.statusCode === 402 || errorMsgLower.includes('quota') || errorMsgLower.includes('billing')) {
        errorMessage = 'AI API quota exceeded. Please check your provider account limits.';
        statusCode = 402;
        shouldFallback = true;
      } else if (errorMsgLower.includes('service unavailable') || errorMsgLower.includes('503')) {
        errorMessage = 'AI service temporarily unavailable. Generating basic feedback...';
        statusCode = 503;
        shouldFallback = true;
      }

      // Fallback: Generate basic feedback without AI if possible
      if (shouldFallback && interview.chatHistory && interview.chatHistory.length > 2) {
        try {
          const userMessages = interview.chatHistory.filter(msg => msg.role === 'user');
          const assistantMessages = interview.chatHistory.filter(msg => msg.role === 'assistant');
          
          // Generate basic feedback based on conversation length and structure
          const basicFeedback = {
            confidenceScore: 50,
            contentScore: 50,
            suggestions: `Basic Feedback (AI unavailable):\n\nYou completed ${userMessages.length} questions in this interview session. The AI feedback service is currently unavailable, but you can review your answers and practice more to improve.\n\nTo get detailed AI feedback, please try again later when the service is available.`,
            strengths: ['Completed the interview session'],
            improvements: ['Review your answers and practice more'],
            overallScore: 50,
            scoresByDimension: {
              communication: 50,
              content: 50,
              confidence: 50,
              structure: 50,
            },
            perQuestionFeedback: [],
          };
          
          interview.feedback = basicFeedback;
          interview.status = 'completed';
          await interview.save();
          
          logger.info('Fallback feedback generated', {
            interviewId: id,
            userId: req.user?._id,
          });
          
          res.json({ 
            success: true, 
            data: interview,
            warning: 'AI feedback unavailable. Basic feedback provided.',
          });
          return;
        } catch (fallbackError) {
          logger.error('Fallback feedback generation failed', fallbackError, {
            interviewId: id,
            userId: req.user?._id,
          });
        }
      }

      const durationMs = Date.now() - startedAt;
      logAIUsage({
        userId: req.user?._id?.toString(),
        endpoint: '/api/interviews/:id/end',
        type: 'interview_feedback',
        model,
        durationMs,
        success: false,
        errorCode: errorObj.status || errorObj.statusCode || 'UNKNOWN',
      });

      res.status(statusCode).json({ 
        success: false, 
        message: errorMessage,
        error: err.message || 'AI API error',
        retryable: statusCode === 503 || statusCode === 429,
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
      .sort({ createdAt: -1 })
      .lean(); // Use lean() for better performance
      
    res.json({ success: true, data: interviews });
  } catch (error) {
    next(error);
  }
};

export const getInterviewAnalytics = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const interviews = await Interview.find({ user: userId })
      .select('persona feedback status createdAt')
      .lean(); // Use lean() for better performance

    if (!interviews.length) {
      res.json({
        success: true,
        data: {
          totalSessions: 0,
          completedSessions: 0,
          averageScore: 0,
          sessionsByPersona: {},
          averageScoresByPersona: {},
          trendLast5: [],
        },
      });
      return;
    }

    const totalSessions = interviews.length;
    const completed = interviews.filter(i => i.status === 'completed' && i.feedback?.overallScore != null);
    const completedSessions = completed.length;

    const averageScore =
      completedSessions > 0
        ? Math.round(
            completed.reduce((sum, i) => sum + (i.feedback?.overallScore ?? 0), 0) / completedSessions,
          )
        : 0;

    const sessionsByPersona: Record<string, number> = {};
    const scoresByPersona: Record<string, { total: number; count: number }> = {};

    for (const i of interviews) {
      const persona = i.persona;
      sessionsByPersona[persona] = (sessionsByPersona[persona] || 0) + 1;

      if (i.status === 'completed' && i.feedback?.overallScore != null) {
        if (!scoresByPersona[persona]) {
          scoresByPersona[persona] = { total: 0, count: 0 };
        }
        scoresByPersona[persona].total += i.feedback.overallScore ?? 0;
        scoresByPersona[persona].count += 1;
      }
    }

    const averageScoresByPersona: Record<string, number> = {};
    for (const [persona, agg] of Object.entries(scoresByPersona)) {
      averageScoresByPersona[persona] =
        agg.count > 0 ? Math.round(agg.total / agg.count) : 0;
    }

    const last5Completed = completed
      .slice()
      .sort((a, b) => (a.createdAt?.getTime?.() || 0) - (b.createdAt?.getTime?.() || 0))
      .slice(-5)
      .map(i => ({
        id: i._id,
        createdAt: i.createdAt,
        persona: i.persona,
        overallScore: i.feedback?.overallScore ?? 0,
      }));

    res.json({
      success: true,
      data: {
        totalSessions,
        completedSessions,
        averageScore,
        sessionsByPersona,
        averageScoresByPersona,
        trendLast5: last5Completed,
      },
    });
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