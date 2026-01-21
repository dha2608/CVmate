import { Request, Response, NextFunction } from 'express';
import Job from '../models/Job.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export const getJobs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const jobs = await Job.find().sort({ postedAt: -1 });
    res.json({ success: true, data: jobs });
  } catch (error) {
    next(error);
  }
};

export const createJob = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const job = await Job.create(req.body);
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

        // Check if already applied
        if (job.applicants.includes(req.user._id)) {
             res.status(400).json({ success: false, message: 'Already applied' });
             return;
        }

        job.applicants.push(req.user._id);
        await job.save();

        res.json({ success: true, message: 'Application successful' });
    } catch (error) {
        next(error);
    }
}
