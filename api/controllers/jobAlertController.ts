import type { Response } from 'express';
import type { AuthRequest } from '../middleware/authMiddleware.js';
import JobAlert from '../models/JobAlert.js';

const MAX_ALERTS_PER_USER = 10;

/**
 * GET /api/job-alerts
 * Get all job alerts for the current user
 */
export const getMyAlerts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const alerts = await JobAlert.find({ user: req.user!._id }).sort({ createdAt: -1 }).lean();

    res.json({ success: true, alerts });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch job alerts' });
  }
};

/**
 * POST /api/job-alerts
 * Create a new job alert
 */
export const createAlert = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, filters } = req.body;

    if (!name || !filters) {
      res.status(400).json({ success: false, error: 'Name and filters are required' });
      return;
    }

    // Check alert limit
    const count = await JobAlert.countDocuments({ user: req.user!._id });
    if (count >= MAX_ALERTS_PER_USER) {
      res.status(400).json({
        success: false,
        error: `Maximum ${MAX_ALERTS_PER_USER} alerts allowed. Delete an existing alert first.`,
      });
      return;
    }

    const alert = await JobAlert.create({
      user: req.user!._id,
      name,
      filters: {
        search: filters.search || undefined,
        type: filters.type || undefined,
        location: filters.location || undefined,
        salaryMin: filters.salaryMin || undefined,
        salaryMax: filters.salaryMax || undefined,
        experienceLevel: filters.experienceLevel || undefined,
        companySize: filters.companySize || undefined,
      },
    });

    res.status(201).json({ success: true, alert });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create job alert' });
  }
};

/**
 * PUT /api/job-alerts/:id
 * Update a job alert
 */
export const updateAlert = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, filters, active } = req.body;

    const alert = await JobAlert.findOne({ _id: id, user: req.user!._id });
    if (!alert) {
      res.status(404).json({ success: false, error: 'Alert not found' });
      return;
    }

    if (name !== undefined) alert.name = name;
    if (filters !== undefined) alert.filters = filters;
    if (active !== undefined) alert.active = active;

    await alert.save();
    res.json({ success: true, alert });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update job alert' });
  }
};

/**
 * DELETE /api/job-alerts/:id
 * Delete a job alert
 */
export const deleteAlert = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const alert = await JobAlert.findOneAndDelete({ _id: id, user: req.user!._id });
    if (!alert) {
      res.status(404).json({ success: false, error: 'Alert not found' });
      return;
    }

    res.json({ success: true, message: 'Alert deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete job alert' });
  }
};

/**
 * PATCH /api/job-alerts/:id/toggle
 * Toggle a job alert active/inactive
 */
export const toggleAlert = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const alert = await JobAlert.findOne({ _id: id, user: req.user!._id });
    if (!alert) {
      res.status(404).json({ success: false, error: 'Alert not found' });
      return;
    }

    alert.active = !alert.active;
    await alert.save();

    res.json({ success: true, alert });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to toggle job alert' });
  }
};
