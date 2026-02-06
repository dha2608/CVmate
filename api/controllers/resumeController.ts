import { Response, NextFunction } from 'express';
import Resume from '../models/Resume.js';
import ResumeHistory from '../models/ResumeHistory.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import logger from '../utils/logger.js';
import { getHFOrThrow, resolveModel, buildCacheKey, getCachedOrRun, logAIUsage } from '../utils/aiClient.js';
import { checkAndAwardAchievement } from './achievementController.js';

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

    // Check for first CV achievement
    const resumeCount = await Resume.countDocuments({ user: req.user?._id });
    if (resumeCount === 1) {
      await checkAndAwardAchievement(
        req.user?._id.toString(),
        'first_cv',
        { resumeId: resume._id.toString() }
      );
    }

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

    const existing = await Resume.findById(req.params.id);

    if (!existing) {
      res.status(404).json({ success: false, message: 'Resume not found' });
      return;
    }

    const userId = req.user?._id;
    const isOwner = existing.user.toString() === String(userId);
    const isCollaborator = Array.isArray(existing.collaborators)
      ? existing.collaborators.some(c => c.toString() === String(userId))
      : false;

    if (!isOwner && !isCollaborator) {
      res.status(403).json({ success: false, message: 'Not authorized to edit this resume' });
      return;
    }

    // Save history snapshot before updating (owner only to avoid noisy history from collaborators if needed)
    try {
      await ResumeHistory.create({
        user: existing.user,
        resume: existing._id,
        snapshot: existing.toObject(),
      });
    } catch (historyError) {
      logger.warn('Failed to save resume history', {
        error: historyError,
        resumeId: existing._id,
        userId,
      });
    }

    existing.set(updateData);
    const updatedResume = await existing.save();

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

export const getResumeHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const resume = await Resume.findOne({ _id: req.params.id, user: userId });
    if (!resume) {
      res.status(404).json({ success: false, message: 'Resume not found' });
      return;
    }

    const history = await ResumeHistory.find({ resume: resume._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .select('createdAt snapshot');

    res.json({ success: true, data: history });
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

    const model = resolveModel(req, 'chat');
    const payload = { text, type };
    const cacheKey = buildCacheKey('resume_enhance', model, payload);

    const startedAt = Date.now();
    try {
      const enhancedText = await getCachedOrRun(cacheKey, 2 * 60 * 1000, async () => {
        const hf = getHFOrThrow();
    const prompt = `
You are a senior CV and resume writer.
Enhance the following ${type || 'text'} to be more impactful and tailored for modern ATS-friendly resumes.
- Use strong, varied action verbs.
- Quantify results where possible with concrete numbers or percentages.
- Fix grammar and improve clarity and flow.
- Keep the tone professional and concise (2–4 lines).
- Do NOT add information that is not already implied by the original text.
      
Original Text:
${text}
      
Enhanced Text (ONLY return the improved text, no explanations):
    `;

      const completion = await hf.chatCompletion({
          model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 256,
          temperature: 0.6,
      });

        const content = completion.choices?.[0]?.message?.content;
        if (!content) {
          throw new Error('No response from AI provider');
        }

        return content.trim();
      });

      const durationMs = Date.now() - startedAt;
      logAIUsage({
        userId: req.user?._id?.toString(),
        endpoint: '/api/resumes/ai-enhance',
        type: 'resume_enhance',
        model,
        durationMs,
        success: true,
      });

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
      
      if (errorObj.status === 401 || errorObj.statusCode === 401 || errorMsgLower.includes('api key')) {
        errorMessage = 'AI API key is invalid or missing. Please check HF_API_KEY in your .env file.';
      } else if (errorObj.status === 429 || errorObj.statusCode === 429 || errorMsgLower.includes('rate limit')) {
        errorMessage = 'AI API rate limit exceeded. Please try again later.';
      } else if (errorMsgLower.includes('quota') || errorMsgLower.includes('billing')) {
        errorMessage = 'AI API quota exceeded. Please check your provider account limits.';
      }

      const durationMs = Date.now() - startedAt;
      logAIUsage({
        userId: req.user?._id?.toString(),
        endpoint: '/api/resumes/ai-enhance',
        type: 'resume_enhance',
        model,
        durationMs,
        success: false,
        errorCode: (errorObj.status || errorObj.statusCode || 'UNKNOWN') as any,
      });

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

    const model = resolveModel(req, 'chat');
    const payload = { resumeId: req.params.id, jobDescription: jobDescription || null };
    const cacheKey = buildCacheKey('resume_analyze', model, payload);

    const startedAt = Date.now();

    try {
      const analysis = await getCachedOrRun(cacheKey, 10 * 60 * 1000, async () => {
        const hf = getHFOrThrow();

      const completion = await hf.chatCompletion({
          model,
        messages: [
          {
            role: 'system',
            content:
                'You are an ATS and resume analysis assistant. Only respond with a valid JSON object and no other text.',
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 512,
        temperature: 0.2,
      });

      const responseContent = completion.choices?.[0]?.message?.content;
      if (!responseContent) {
          throw new Error('No response from AI provider');
      }

        return JSON.parse(responseContent);
      });
      
      resume.atsScore = (analysis as any).score || 0;
      await resume.save();

      const durationMs = Date.now() - startedAt;
      logAIUsage({
        userId: req.user?._id?.toString(),
        endpoint: '/api/resumes/:id/analyze',
        type: 'resume_analyze',
        model,
        durationMs,
        success: true,
      });

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
      
      if (errorObj.status === 401 || errorObj.statusCode === 401 || errorMsgLower.includes('api key')) {
        errorMessage = 'AI API key is invalid or missing. Please check HF_API_KEY in your .env file.';
      } else if (errorObj.status === 429 || errorObj.statusCode === 429 || errorMsgLower.includes('rate limit')) {
        errorMessage = 'AI API rate limit exceeded. Please try again later.';
      } else if (errorMsgLower.includes('quota') || errorMsgLower.includes('billing')) {
        errorMessage = 'AI API quota exceeded. Please check your provider account limits.';
      }

      const durationMs = Date.now() - startedAt;
      logAIUsage({
        userId: req.user?._id?.toString(),
        endpoint: '/api/resumes/:id/analyze',
        type: 'resume_analyze',
        model,
        durationMs,
        success: false,
        errorCode: (errorObj.status || errorObj.statusCode || 'UNKNOWN') as any,
      });

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
    const { prompt, jobDescription, role, mode } = req.body as { 
      prompt?: string; 
      jobDescription?: string;
      role?: 'frontend' | 'backend' | 'fullstack' | 'qa' | 'designer' | 'devops' | 'data' | 'other';
      mode?: 'concise' | 'human';
    };

    if (!prompt && !jobDescription) {
      res.status(400).json({
        success: false,
        message: 'Prompt or job description is required',
      });
      return;
    }

    const model = resolveModel(req, 'chat');
    const payload = { prompt: prompt || null, jobDescription: jobDescription || null, role, mode };
    const cacheKey = buildCacheKey('resume_generate', model, payload);

    // Role-based prompt templates
    const rolePrompts: Record<string, string> = {
      frontend: 'You are an expert resume writer specializing in Frontend Development roles. Focus on: React, Vue, Angular, TypeScript, UI/UX, responsive design, performance optimization, modern frameworks, and frontend architecture.',
      backend: 'You are an expert resume writer specializing in Backend Development roles. Focus on: Node.js, Python, Java, APIs, databases, microservices, system design, scalability, and server architecture.',
      fullstack: 'You are an expert resume writer specializing in Fullstack Development roles. Balance both frontend and backend skills, emphasize end-to-end ownership, and full product development experience.',
      qa: 'You are an expert resume writer specializing in QA/Testing roles. Focus on: test automation, manual testing, CI/CD, test frameworks, bug tracking, quality assurance processes, and testing methodologies.',
      designer: 'You are an expert resume writer specializing in UI/UX Design roles. Focus on: design systems, user research, prototyping, Figma, design thinking, user experience, and visual design.',
      devops: 'You are an expert resume writer specializing in DevOps/Infrastructure roles. Focus on: CI/CD, cloud platforms, containerization, monitoring, infrastructure as code, and automation.',
      data: 'You are an expert resume writer specializing in Data Science/Analytics roles. Focus on: data analysis, machine learning, SQL, Python, data visualization, and statistical methods.',
      other: 'You are an expert resume writer. Create a professional, ATS-friendly resume that highlights relevant skills and experience.',
    };

    const rolePrompt = rolePrompts[role || 'other'] || rolePrompts.other;
    const isConciseMode = mode === 'concise';

    // Extract keywords from JD if provided
    const extractKeywords = (jd: string): string[] => {
      const commonTech = ['react', 'vue', 'angular', 'node', 'python', 'java', 'typescript', 'javascript', 'sql', 'aws', 'docker', 'kubernetes', 'git', 'agile', 'scrum'];
      const words = jd.toLowerCase().split(/\s+/);
      return commonTech.filter(tech => words.some(w => w.includes(tech)));
    };

    const keywords = jobDescription ? extractKeywords(jobDescription) : [];

    const basePrompt = `
      ${rolePrompt}
      
      ${isConciseMode 
        ? 'MODE: ATS-OPTIMIZED (Concise)\n- Keep descriptions SHORT and keyword-dense\n- Use 2-3 bullet points per experience (max 1 line each)\n- Prioritize quantifiable metrics and keywords\n- Remove fluff, focus on achievements\n- Optimize for Applicant Tracking Systems'
        : 'MODE: HUMAN-READABLE\n- Write naturally flowing descriptions\n- Use 3-5 bullet points per experience\n- Tell a story, show impact\n- More engaging for human recruiters\n- Still ATS-friendly but more narrative'
      }
      
      ${keywords.length > 0 ? `\nPRIORITY KEYWORDS (from Job Description): ${keywords.join(', ')}\n- Naturally incorporate these keywords into the resume\n- Prioritize experiences that match these keywords` : ''}
      
      Generate a JSON object for a professional resume. The JSON MUST have exactly this structure:
      {
        "summary": "string, ${isConciseMode ? '2-3 sentences' : '3-4 sentences'} professional summary${keywords.length > 0 ? ', include relevant keywords' : ''}",
        "experience": [
          {
            "company": "string",
            "position": "string",
            "startDate": "YYYY-MM",
            "endDate": "YYYY-MM or Present",
            "description": "${isConciseMode ? '2-3 short bullet points (max 1 line each), focus on metrics and keywords' : '3-5 bullet points, natural narrative with impact'}"
          }
        ],
        "education": [
          {
            "institution": "string",
            "degree": "string",
            "startDate": "YYYY-MM",
            "endDate": "YYYY-MM or Present",
            "description": "${isConciseMode ? '1-2 lines max' : '2-3 lines'} of key achievements"
          }
        ],
        "skills": ["string", "string", "..."] ${keywords.length > 0 ? '- Prioritize skills matching keywords' : ''}
      }

      User prompt (career background / profile):
      ${prompt || 'N/A'}
      
      ${jobDescription ? `Job description (align resume to this role, prioritize keywords):\n${jobDescription.substring(0, 2000)}` : 'N/A'}
    `;

    const startedAt = Date.now();

    try {
      const data = await getCachedOrRun(cacheKey, 15 * 60 * 1000, async () => {
        const hf = getHFOrThrow();

      const completion = await hf.chatCompletion({
          model,
        messages: [
          {
            role: 'system',
            content:
                'You are an expert resume writer that only responds with a valid JSON object and no other text.',
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

        return JSON.parse(responseContent);
      });

      // Normalize to frontend structure; IDs sẽ được tạo ở client
      const result = {
        summary: typeof (data as any).summary === 'string' ? (data as any).summary : '',
        experience: Array.isArray((data as any).experience) ? (data as any).experience : [],
        education: Array.isArray((data as any).education) ? (data as any).education : [],
        skills: Array.isArray((data as any).skills) ? (data as any).skills : [],
      };

      const durationMs = Date.now() - startedAt;
      logAIUsage({
        userId: req.user?._id?.toString(),
        endpoint: '/api/resumes/ai-generate-full',
        type: 'resume_generate',
        model,
        durationMs,
        success: true,
      });

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

      if (errorObj.status === 401 || errorObj.statusCode === 401 || errorMsgLower.includes('api key')) {
        errorMessage = 'AI API key is invalid or missing. Please check HF_API_KEY in your .env file.';
      } else if (errorObj.status === 429 || errorObj.statusCode === 429 || errorMsgLower.includes('rate limit')) {
        errorMessage = 'AI API rate limit exceeded. Please try again later.';
      } else if (errorMsgLower.includes('quota') || errorMsgLower.includes('billing')) {
        errorMessage = 'AI API quota exceeded. Please check your provider account limits.';
      }

      const durationMs = Date.now() - startedAt;
      logAIUsage({
        userId: req.user?._id?.toString(),
        endpoint: '/api/resumes/ai-generate-full',
        type: 'resume_generate',
        model,
        durationMs,
        success: false,
        errorCode: (errorObj.status || errorObj.statusCode || 'UNKNOWN') as any,
      });

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
