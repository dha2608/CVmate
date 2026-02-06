import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import Job from '../models/Job.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import Application from '../models/Application.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import logger from '../utils/logger.js';
import { getHFOrThrow, resolveModel, buildCacheKey, getCachedOrRun, logAIUsage } from '../utils/aiClient.js';
import { sendJobApplicationEmail } from '../utils/emailService.js';
import { checkAndAwardAchievement } from './achievementController.js';

export const getJobs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const { search, type, location, salaryMin, salaryMax, experienceLevel, companySize } = req.query;
    const query: any = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (type && type !== 'All') {
      query.type = type;
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    // Salary range filter - jobs where salary range overlaps with requested range
    if (salaryMin || salaryMax) {
      const salaryConditions: any[] = [];
      const min = salaryMin ? parseInt(salaryMin as string) : 0;
      const max = salaryMax ? parseInt(salaryMax as string) : Number.MAX_SAFE_INTEGER;
      
      // Job's salary range overlaps with requested range if:
      // - job has salaryMin and salaryMax: (job.salaryMin <= max && job.salaryMax >= min)
      // - job only has salaryMin: (job.salaryMin <= max)
      // - job only has salaryMax: (job.salaryMax >= min)
      // - job has neither: include it (no salary filter)
      salaryConditions.push({
        $or: [
          { salaryMin: { $exists: false }, salaryMax: { $exists: false } },
          {
            $and: [
              { salaryMin: { $exists: true, $lte: max } },
              { salaryMax: { $exists: true, $gte: min } }
            ]
          },
          { 
            $and: [
              { salaryMin: { $exists: true } },
              { salaryMax: { $exists: false } },
              { salaryMin: { $lte: max } }
            ]
          },
          { 
            $and: [
              { salaryMin: { $exists: false } },
              { salaryMax: { $exists: true } },
              { salaryMax: { $gte: min } }
            ]
          }
        ]
      });
      
      if (!query.$and) {
        query.$and = [];
      }
      query.$and.push(...salaryConditions);
    }

    if (experienceLevel) {
      query.experienceLevel = experienceLevel;
    }

    if (companySize) {
      query.companySize = companySize;
    }

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .sort({ postedAt: -1 })
        .skip(skip)
        .limit(limit),
      Job.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: jobs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getJobById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      res.status(404).json({ success: false, message: 'Job not found' });
      return;
    }

    res.json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
};

export const createJob = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, company, location, type, description, salary, requirements } = req.body;

    if (!title || !company || !description) {
      res.status(400).json({ success: false, message: 'Please provide all required fields' });
      return;
    }

    const job = await Job.create({
      title,
      company,
      location,
      type,
      description,
      salary,
      requirements,
      postedBy: req.user?._id,
      postedAt: new Date(),
    });

    res.status(201).json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
};

export const applyJob = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      res.status(404).json({ success: false, message: 'Job not found' });
      return;
    }

    const userId = (req.user?._id as Types.ObjectId).toString();

    const hasApplied = job.applicants.some(
      (applicantId: any) => applicantId.toString() === userId
    );

    if (hasApplied) {
      res.status(400).json({ success: false, message: 'You have already applied for this job' });
      return;
    }

    job.applicants.push(req.user?._id);
    await job.save();

    // Tạo notification cho người đăng tuyển (nếu khác người apply)
    if (job.postedBy.toString() !== userId) {
      await Notification.create({
        recipient: job.postedBy,
        sender: req.user?._id,
        type: 'job',
        message: `đã ứng tuyển vào vị trí "${job.title}".`,
        link: `/jobs`,
      });

      // Gửi email thông báo (best-effort)
      try {
        const poster = await User.findById(job.postedBy).select('email name');
        if (poster?.email) {
          await sendJobApplicationEmail({
            recipientEmail: poster.email,
            applicantName: req.user?.name || 'A candidate',
            jobTitle: job.title,
          });
        }
      } catch (emailError) {
        logger.warn('Failed to send job application email', {
          error: emailError,
          jobId: job._id,
          posterId: job.postedBy,
        });
      }
    }

    res.json({ success: true, message: 'Application successful' });
  } catch (error) {
    next(error);
  }
};

export const getJobRecommendations = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id as Types.ObjectId | undefined;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const user = await User.findById(userId).select('skills industries currentRole careerGoal location');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Base job query (could be extended with filters from query params)
    const jobs = await Job.find({})
      .sort({ postedAt: -1 })
      .limit(50)
      .select('title company location type description skills experienceLevel salaryMin salaryMax companySize');

    if (!jobs.length) {
      res.json({ success: true, data: [] });
      return;
    }

    const model = resolveModel(req, 'chat');
    const payload = {
      user: {
        skills: user.skills || [],
        industries: user.industries || [],
        currentRole: user.currentRole || '',
        careerGoal: user.careerGoal || '',
        location: user.location || '',
      },
      jobs: jobs.map(j => ({
        id: j._id.toString(),
        title: j.title,
        company: j.company,
        location: j.location,
        type: j.type,
        description: j.description,
        skills: (j as any).skills || [],
        experienceLevel: (j as any).experienceLevel || '',
        salaryMin: (j as any).salaryMin ?? null,
        salaryMax: (j as any).salaryMax ?? null,
        companySize: (j as any).companySize || '',
      })),
    };

    const cacheKey = buildCacheKey('job_recommendation', model, payload);
    const startedAt = Date.now();

    try {
      const recommendation = await getCachedOrRun(cacheKey, 10 * 60 * 1000, async () => {
        const hf = getHFOrThrow();

        const systemPrompt = `
You are a career coach and job matching assistant for a platform called CV Mate.
Your task is to rank jobs for the user and return ONLY a JSON object with this exact structure:
{
  "recommendedJobIds": string[],   // array of job IDs in order of best match first
  "reasonSummary": string          // short explanation (2-3 sentences) of why these jobs fit
}

Do not include any additional keys or text.
`;

        const userProfileText = `
User profile:
- Current role: ${user.currentRole || 'N/A'}
- Career goal: ${user.careerGoal || 'N/A'}
- Location: ${user.location || 'N/A'}
- Skills: ${(user.skills || []).join(', ') || 'N/A'}
- Industries: ${(user.industries || []).join(', ') || 'N/A'}
`;

        const jobsText = payload.jobs
          .map(job => {
            const salary =
              job.salaryMin || job.salaryMax
                ? `Salary range: ${job.salaryMin ?? '?'} - ${job.salaryMax ?? '?'}` 
                : 'Salary: N/A';
            return `Job ID: ${job.id}
Title: ${job.title}
Company: ${job.company}
Location: ${job.location}
Type: ${job.type}
Experience level: ${job.experienceLevel || 'N/A'}
Company size: ${job.companySize || 'N/A'}
${salary}
Required / mentioned skills: ${(job.skills || []).join(', ') || 'N/A'}
Description: ${job.description?.slice(0, 500) || ''}`;
          })
          .join('\n\n---\n\n');

        const userPrompt = `
${userProfileText}

Here is the list of available jobs:
${jobsText}

Please pick the 10 best matching jobs (or fewer if there are not enough), based on skills, experience level, location, and career goal. Return only the JSON object as described above.`;

        const completion = await hf.chatCompletion({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: 512,
          temperature: 0.3,
        });

        const content = completion.choices?.[0]?.message?.content;
        if (!content) {
          throw new Error('No response from AI provider');
        }

        return JSON.parse(content);
      });

      const recommendedIds: string[] = Array.isArray((recommendation as any).recommendedJobIds)
        ? (recommendation as any).recommendedJobIds
        : [];

      const idSet = new Set(recommendedIds);
      const recommendedJobs = jobs
        .filter(job => idSet.has(job._id.toString()))
        .sort((a, b) => recommendedIds.indexOf(a._id.toString()) - recommendedIds.indexOf(b._id.toString()));

      const durationMs = Date.now() - startedAt;
      logAIUsage({
        userId: userId.toString(),
        endpoint: '/api/jobs/recommendations',
        type: 'job_recommendation',
        model,
        durationMs,
        success: true,
      });

      res.json({
        success: true,
        data: recommendedJobs,
        meta: {
          totalCandidates: jobs.length,
          recommendedCount: recommendedJobs.length,
          reasonSummary: (recommendation as any).reasonSummary || '',
        },
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('Job recommendation error', err, { userId: userId.toString() });

      const durationMs = Date.now() - startedAt;
      logAIUsage({
        userId: userId.toString(),
        endpoint: '/api/jobs/recommendations',
        type: 'job_recommendation',
        model,
        durationMs,
        success: false,
        errorCode: 'JOB_RECOMMENDATION_ERROR',
      });

      res.status(503).json({
        success: false,
        message: 'Job recommendation service is currently unavailable. Please try again later.',
      });
    }
  } catch (error) {
    next(error);
  }
};