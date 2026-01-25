import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import Job from '../models/Job.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export const getJobs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const { search, type, location } = req.query;
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

    res.json({ success: true, message: 'Application successful' });
  } catch (error) {
    next(error);
  }
};