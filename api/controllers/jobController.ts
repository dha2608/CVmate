import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import Job from '../models/Job.js';
import Notification from '../models/Notification.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

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
    }

    res.json({ success: true, message: 'Application successful' });
  } catch (error) {
    next(error);
  }
};