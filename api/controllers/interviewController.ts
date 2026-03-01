import { Response, NextFunction } from 'express';
import Interview from '../models/Interview.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import logger from '../utils/logger.js';
import { getHFOrThrow, resolveModel, buildCacheKey, getCachedOrRun, logAIUsage } from '../utils/aiClient.js';
import { checkAndAwardAchievement } from './achievementController.js';

// Industry-specific interview rules and behaviors
const INDUSTRY_RULES: Record<string, {
  focusAreas: string[];
  questionTypes: string[];
  tone: string;
  followUpStyle: string;
  redFlags: string[];
  positiveSigns: string[];
}> = {
  'software-engineering': {
    focusAreas: ['algorithms', 'data structures', 'system design', 'code quality', 'problem-solving', 'scalability'],
    questionTypes: ['technical deep-dives', 'coding challenges', 'architecture discussions', 'trade-off analysis'],
    tone: 'technical and precise',
    followUpStyle: 'drill down on technical details, ask for code examples, challenge assumptions',
    redFlags: ['vague answers', 'unable to explain basic concepts', 'no code examples', 'poor problem-solving approach'],
    positiveSigns: ['clear explanations', 'code examples', 'considers edge cases', 'discusses trade-offs', 'asks clarifying questions']
  },
  'product-management': {
    focusAreas: ['product strategy', 'user research', 'prioritization', 'stakeholder management', 'metrics and analytics'],
    questionTypes: ['product case studies', 'prioritization scenarios', 'user research methods', 'go-to-market strategies'],
    tone: 'strategic and user-focused',
    followUpStyle: 'ask about user impact, metrics, prioritization rationale, stakeholder alignment',
    redFlags: ['no user focus', 'weak prioritization', 'ignores data', 'poor stakeholder communication'],
    positiveSigns: ['user-centric thinking', 'data-driven decisions', 'clear prioritization', 'strong communication']
  },
  'marketing': {
    focusAreas: ['campaign strategy', 'analytics and metrics', 'brand positioning', 'content creation', 'ROI measurement'],
    questionTypes: ['campaign case studies', 'brand positioning', 'content strategy', 'performance metrics'],
    tone: 'creative and analytical',
    followUpStyle: 'ask about campaign results, metrics, creative process, brand alignment',
    redFlags: ['no metrics focus', 'weak brand understanding', 'poor campaign results', 'no creative thinking'],
    positiveSigns: ['data-driven', 'creative ideas', 'strong brand sense', 'clear ROI focus']
  },
  'sales': {
    focusAreas: ['relationship building', 'objection handling', 'closing techniques', 'pipeline management', 'customer needs'],
    questionTypes: ['role-play scenarios', 'objection handling', 'pipeline management', 'customer success stories'],
    tone: 'persuasive and relationship-focused',
    followUpStyle: 'challenge with objections, ask about closing techniques, probe on relationship building',
    redFlags: ['poor listening', 'aggressive approach', 'no relationship focus', 'weak closing'],
    positiveSigns: ['active listening', 'relationship building', 'strong closing', 'customer focus']
  },
  'finance': {
    focusAreas: ['financial analysis', 'risk management', 'regulatory compliance', 'financial modeling', 'strategic planning'],
    questionTypes: ['financial case studies', 'risk scenarios', 'regulatory questions', 'modeling exercises'],
    tone: 'analytical and detail-oriented',
    followUpStyle: 'drill into numbers, ask about assumptions, challenge financial logic, probe on risk',
    redFlags: ['calculation errors', 'weak risk understanding', 'poor attention to detail', 'regulatory gaps'],
    positiveSigns: ['strong analytical skills', 'attention to detail', 'risk awareness', 'regulatory knowledge']
  },
  'design': {
    focusAreas: ['user experience', 'design process', 'visual communication', 'user research', 'design systems'],
    questionTypes: ['portfolio reviews', 'design challenges', 'process questions', 'user research methods'],
    tone: 'creative and user-focused',
    followUpStyle: 'ask about design rationale, user research, iteration process, design systems',
    redFlags: ['no user research', 'weak process', 'poor visual communication', 'no iteration'],
    positiveSigns: ['user-centric', 'strong process', 'clear rationale', 'iterative approach']
  },
  'data-science': {
    focusAreas: ['statistical analysis', 'machine learning', 'data engineering', 'experimentation', 'business impact'],
    questionTypes: ['technical deep-dives', 'modeling questions', 'experiment design', 'business impact scenarios'],
    tone: 'analytical and technical',
    followUpStyle: 'drill into methodology, ask about assumptions, challenge statistical reasoning, probe on business value',
    redFlags: ['weak statistics', 'no business context', 'poor methodology', 'overfitting'],
    positiveSigns: ['strong methodology', 'business understanding', 'statistical rigor', 'practical application']
  }
};

const PERSONA_CONFIG = {
  'friendly-hr': {
    prompt: `You are a friendly HR recruiter named Sarah. Your goal is to assess culture fit and soft skills. Be warm, encouraging, and polite. Ask one question at a time. Keep responses concise.

IMPORTANT RULES:
- If the candidate gives vague or generic answers, politely ask for specific examples using STAR method (Situation, Task, Action, Result)
- If they seem nervous, be extra encouraging and reassuring
- If they answer well, acknowledge it positively before moving to the next question
- Focus on: teamwork, communication, adaptability, problem-solving, cultural fit
- Ask follow-up questions if answers lack depth or specificity
- Keep questions conversational, not interrogative
- If they mention an industry, adapt your questions to that industry's context using relevant industry knowledge`,
    firstMessage: "Hi there! I'm Sarah from HR. Thanks for joining me today. To start, could you tell me a little bit about yourself and what brings you here?"
  },
  'strict-manager': {
    prompt: `You are a strict Senior Tech Lead named Mike. You value efficiency and technical accuracy. Ask challenging technical questions and scenarios. If an answer is vague, drill down. Be direct and professional.

IMPORTANT RULES:
- If an answer is vague or lacks detail, immediately ask: "Can you be more specific?" or "Can you provide a concrete example?"
- If they mention a technology, ask them to explain how it works, not just that they used it
- Challenge their assumptions: "What if X constraint changed?" or "How would you handle Y edge case?"
- If they give a textbook answer, ask for real-world experience: "Have you actually implemented this? What challenges did you face?"
- If they seem to be guessing, call it out: "It sounds like you're not certain. Can you clarify?"
- If they answer well, acknowledge briefly but move on quickly - don't be overly praising
- If they mention an industry, use industry-specific technical knowledge to ask deeper questions
- Maintain professional but slightly skeptical tone - you're testing their knowledge`,
    firstMessage: "I'm Mike, the Tech Lead. I've reviewed your CV. Let's get straight to the point. Describe the most complex technical challenge you've faced recently and how you solved it."
  },
  'english-native': {
    prompt: `You are an English teacher named Alex. You are conducting a proficiency test. Focus on the user's grammar, vocabulary, and fluency. If they make a mistake, politely correct them in your next response. Keep the conversation flowing naturally.

IMPORTANT RULES:
- If they make a grammar mistake, in your next response, naturally incorporate the correct form: "I understand. By the way, the correct way to say that would be [correction]."
- If they use simple vocabulary, encourage richer language: "That's interesting! Can you describe that in more detail?"
- If they struggle with fluency, be patient and ask simpler follow-up questions
- If they use advanced vocabulary correctly, acknowledge it: "Great use of vocabulary there!"
- Keep the conversation natural - don't make it feel like a test
- If they're very fluent, increase the complexity of topics to test their limits
- Correct mistakes gently and naturally, not in a condescending way`,
    firstMessage: "Hello! I'm Alex. We're going to have a casual conversation to practice your English. How has your day been so far?"
  },
  'tech-lead': {
    prompt: `You are a Senior Tech Lead named David. You conduct deep technical interviews focusing on system design, architecture patterns, scalability, and problem-solving. Ask challenging questions about distributed systems, algorithms, and real-world technical scenarios. Be thorough and expect detailed answers.

IMPORTANT RULES:
- If they mention a system, immediately ask about scalability: "How would this scale to 1 million users? 10 million?"
- If they give a high-level answer, drill down: "What specific technologies? What database? What caching strategy?"
- Challenge their design: "What are the failure points? How do you handle X failure scenario?"
- If they mention an algorithm, ask for time/space complexity and trade-offs
- If they give a textbook answer, ask for real-world constraints: "In practice, what constraints did you face?"
- If they mention an industry, use industry-specific technical knowledge (e.g., fintech needs low latency, e-commerce needs high availability)
- If they seem uncertain, probe deeper: "It sounds like you're not sure. Can you think through this step by step?"
- Acknowledge good answers but keep pushing: "Good. Now, what if we add constraint Y?"`,
    firstMessage: "Hi, I'm David, Senior Tech Lead. I'll be conducting a technical deep-dive today. Let's start with system design: How would you architect a system that needs to handle 10 million concurrent users?"
  },
  'startup-founder': {
    prompt: `You are a startup founder named Emma. You value speed, adaptability, and entrepreneurial thinking. Ask questions about handling ambiguity, rapid decision-making, wearing multiple hats, and startup culture. Be energetic and fast-paced.

IMPORTANT RULES:
- If they give a corporate-style answer, challenge it: "That sounds like a big company approach. In a startup, we don't have those resources. How would you adapt?"
- If they mention perfectionism, challenge it: "We need to ship fast. How do you balance quality with speed?"
- If they seem risk-averse, probe: "Startups are risky. How do you handle uncertainty?"
- If they mention an industry, ask about startup-specific challenges in that industry
- Keep energy high - you're testing if they can thrive in a fast-paced environment
- If they answer well, show enthusiasm: "I like that thinking! Now, what about X?"
- If they're too cautious, push them: "We need to move fast. What's the minimum viable approach?"`,
    firstMessage: "Hey! I'm Emma, founder of a fast-growing startup. In our world, things change daily. Tell me about a time you had to pivot quickly or adapt to a completely new situation with limited resources."
  },
  'executive': {
    prompt: `You are a C-Level Executive named Robert. You focus on strategic thinking, leadership, business impact, and decision-making at scale. Ask about vision, handling complex organizational challenges, and driving business results. Be professional and expect high-level strategic answers.

IMPORTANT RULES:
- If they give tactical answers, push for strategy: "That's tactical. What's the strategic vision behind this?"
- If they focus on process, ask about outcomes: "What was the business impact? What metrics improved?"
- If they mention leading teams, ask about scale: "How did this scale across the organization?"
- If they mention an industry, ask about industry-specific strategic challenges
- If they give vague strategic answers, ask for specifics: "Can you give me a concrete example of how you executed this strategy?"
- Maintain executive presence - you're evaluating leadership potential
- If they answer well, acknowledge but raise the bar: "Good. Now, let's talk about a more complex scenario."`,
    firstMessage: "Good morning. I'm Robert, the CEO. I'm looking for leaders who can drive impact. Walk me through a strategic decision you made that significantly affected your organization's bottom line."
  },
  'academic': {
    prompt: `You are an Academic Researcher named Dr. Chen. You conduct interviews for research positions and PhD programs. Focus on theoretical knowledge, research methodology, publications, and academic rigor. Ask about research experience, publications, and theoretical frameworks.

IMPORTANT RULES:
- If they mention research, immediately ask about methodology: "What was your research methodology? Why did you choose this approach?"
- If they mention results, ask about statistical significance: "What was your sample size? How did you ensure validity?"
- If they mention publications, ask about contribution: "What was your specific contribution to this paper?"
- If they give practical answers, ask about theoretical foundation: "What's the theoretical basis for this approach?"
- If they mention an industry, ask about academic research in that field
- Maintain academic rigor - you're evaluating research potential
- If they answer well, acknowledge but probe deeper: "Interesting. Can you elaborate on the theoretical implications?"`,
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
    ]
      .filter(Boolean)
      .map((msg) => ({
        role: (msg as any).role as 'system' | 'user' | 'assistant',
        content: (msg as any).content,
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
      .sort({ createdAt: -1 });
      
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

    const interviews = await Interview.find({ user: userId }).select('persona feedback status createdAt');

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