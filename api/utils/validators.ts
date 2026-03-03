import { z } from 'zod';

/**
 * Authentication Validation Schemas
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email format').trim().toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  email: z
    .string()
    .email('Invalid email format')
    .trim()
    .toLowerCase()
    .max(255, 'Email must be less than 255 characters'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  email: z.string().email().trim().toLowerCase().max(255).optional(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .optional(),
  avatar: z.string().url().optional().or(z.literal('')),
  bio: z.string().max(1000).trim().optional(),
  headline: z.string().max(200).trim().optional(),
  location: z.string().max(200).trim().optional(),
  yearsOfExperience: z.number().int().min(0).max(50).optional(),
  currentRole: z.string().max(200).trim().optional(),
  industries: z.array(z.string().trim()).optional(),
  skills: z.array(z.string().trim()).optional(),
  socialLinks: z
    .object({
      linkedin: z.string().url().optional().or(z.literal('')),
      github: z.string().url().optional().or(z.literal('')),
      portfolio: z.string().url().optional().or(z.literal('')),
    })
    .optional(),
  isPublicProfile: z.boolean().optional(),
});

/**
 * Job Validation Schemas
 */
export const createJobSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200).trim(),
  company: z.string().min(2, 'Company name must be at least 2 characters').max(200).trim(),
  location: z.string().min(2).max(200).trim(),
  type: z.enum(['Full-time', 'Part-time', 'Remote', 'Contract', 'Internship']),
  salary: z.string().max(100).trim().optional(),
  salaryMin: z.number().int().min(0).optional(),
  salaryMax: z.number().int().min(0).optional(),
  experienceLevel: z.enum(['Entry', 'Mid', 'Senior', 'Executive']).optional(),
  companySize: z.enum(['Startup', 'Small', 'Medium', 'Large', 'Enterprise']).optional(),
  description: z.string().min(50, 'Description must be at least 50 characters').max(5000).trim(),
  requirements: z.array(z.string().trim()).optional().default([]),
});

/**
 * Post Validation Schemas
 */
export const createPostSchema = z
  .object({
    content: z
      .string()
      .max(5000, 'Content must be less than 5000 characters')
      .trim()
      .optional()
      .or(z.literal('')),
    // Allow both absolute and relative URLs for images (e.g. /uploads/filename.jpg)
    image: z.string().trim().optional().or(z.literal('')),
  })
  .refine(
    (data) => {
      const hasContent = typeof data.content === 'string' && data.content.trim().length > 0;
      const hasImage = typeof data.image === 'string' && data.image.trim().length > 0;
      return hasContent || hasImage;
    },
    {
      message: 'Content or image is required',
    }
  );

export const commentPostSchema = z.object({
  text: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(1000, 'Comment must be less than 1000 characters')
    .trim(),
  parentId: z.string().optional(),
});

/**
 * Resume Validation Schemas
 */
export const createResumeSchema = z
  .object({
    title: z.string().min(1).max(200).trim().optional(),
    personalInfo: z.object({
      fullName: z.string().min(1, 'Full name is required').max(100).trim(),
      email: z.string().email('Invalid email format').trim(),
      phone: z.string().trim().optional().or(z.literal('')),
      address: z.string().trim().optional().or(z.literal('')),
      linkedin: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
      website: z.string().url('Invalid website URL').optional().or(z.literal('')),
    }),
    summary: z.string().max(2000).trim().optional().or(z.literal('')),
    experience: z
      .array(
        z.object({
          company: z.string().trim().optional(),
          position: z.string().trim().optional(),
          startDate: z.string().trim().optional(),
          endDate: z.string().trim().optional(),
          description: z.string().trim().optional(),
        })
      )
      .optional()
      .default([]),
    education: z
      .array(
        z.object({
          institution: z.string().trim().optional(),
          degree: z.string().trim().optional(),
          startDate: z.string().trim().optional(),
          endDate: z.string().trim().optional(),
          description: z.string().trim().optional(),
        })
      )
      .optional()
      .default([]),
    skills: z.array(z.string().trim()).optional().default([]),
    variantType: z.enum(['general', 'job-a', 'job-b']).optional(),
    themeConfig: z
      .object({
        color: z.string().optional(),
        font: z.string().optional(),
        layout: z.string().optional(),
      })
      .optional(),
  })
  .refine(
    (data) => {
      // Validate that experience items have both company and position if they have any data
      if (data.experience && data.experience.length > 0) {
        for (const exp of data.experience) {
          const hasAnyData =
            exp.company || exp.position || exp.description || exp.startDate || exp.endDate;
          if (hasAnyData && (!exp.company || !exp.position)) {
            return false;
          }
        }
      }
      // Validate that education items have both institution and degree if they have any data
      if (data.education && data.education.length > 0) {
        for (const edu of data.education) {
          const hasAnyData =
            edu.institution || edu.degree || edu.description || edu.startDate || edu.endDate;
          if (hasAnyData && (!edu.institution || !edu.degree)) {
            return false;
          }
        }
      }
      return true;
    },
    {
      message:
        'Experience items must have both company and position. Education items must have both institution and degree.',
    }
  );

/**
 * Interview Validation Schemas
 */
export const startInterviewSchema = z.object({
  persona: z.enum([
    'friendly-hr',
    'strict-manager',
    'english-native',
    'tech-lead',
    'startup-founder',
    'executive',
    'academic',
  ]),
});

export const sendInterviewMessageSchema = z.object({
  message: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message must be less than 2000 characters')
    .trim(),
});

/**
 * Onboarding Validation Schema
 */
export const onboardingSchema = z.object({
  careerGoal: z.enum(['new-job', 'internship', 'career-switch']),
});

/**
 * Message Validation Schemas
 */
export const sendMessageSchema = z
  .object({
    receiverId: z.string().min(1, 'Receiver is required'),
    content: z
      .string()
      .max(5000, 'Message must be less than 5000 characters')
      .trim()
      .optional()
      .or(z.literal('')),
    image: z.string().trim().optional().or(z.literal('')),
  })
  .refine(
    (data) => {
      const hasContent = typeof data.content === 'string' && data.content.trim().length > 0;
      const hasImage = typeof data.image === 'string' && data.image.trim().length > 0;
      return hasContent || hasImage;
    },
    {
      message: 'Content or image is required',
    }
  );

export const typingSchema = z.object({
  receiverId: z.string().min(1, 'Receiver is required'),
});

/**
 * Article Validation Schemas
 */
export const createArticleSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(300, 'Title must be less than 300 characters')
    .trim(),
  content: z
    .string()
    .min(50, 'Content must be at least 50 characters')
    .max(50000, 'Content must be less than 50000 characters')
    .trim(),
  category: z.string().min(1, 'Category is required').max(100).trim(),
  image: z.string().trim().optional().or(z.literal('')),
});

export const updateArticleSchema = z.object({
  title: z.string().min(3).max(300).trim().optional(),
  content: z.string().min(50).max(50000).trim().optional(),
  category: z.string().min(1).max(100).trim().optional(),
  image: z.string().trim().optional().or(z.literal('')),
});

export const articleCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(2000, 'Comment must be less than 2000 characters')
    .trim(),
});

/**
 * Post Update Validation Schema
 */
export const updatePostSchema = z
  .object({
    content: z
      .string()
      .max(5000, 'Content must be less than 5000 characters')
      .trim()
      .optional()
      .or(z.literal('')),
    image: z.string().trim().optional().or(z.literal('')),
  })
  .refine(
    (data) => {
      const hasContent = typeof data.content === 'string' && data.content.trim().length > 0;
      const hasImage = typeof data.image === 'string' && data.image.trim().length > 0;
      return hasContent || hasImage;
    },
    {
      message: 'Content or image is required',
    }
  );

/**
 * Job Alert Validation Schemas
 */
export const createJobAlertSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  filters: z
    .object({
      search: z.string().max(200).trim().optional(),
      type: z.string().max(50).trim().optional(),
      location: z.string().max(200).trim().optional(),
      salaryMin: z.number().int().min(0).optional(),
      salaryMax: z.number().int().min(0).optional(),
      experienceLevel: z.string().max(50).trim().optional(),
      companySize: z.string().max(50).trim().optional(),
    })
    .optional()
    .default({}),
});

export const updateJobAlertSchema = z.object({
  name: z.string().min(1).max(100).trim().optional(),
  filters: z
    .object({
      search: z.string().max(200).trim().optional(),
      type: z.string().max(50).trim().optional(),
      location: z.string().max(200).trim().optional(),
      salaryMin: z.number().int().min(0).optional(),
      salaryMax: z.number().int().min(0).optional(),
      experienceLevel: z.string().max(50).trim().optional(),
      companySize: z.string().max(50).trim().optional(),
    })
    .optional(),
  active: z.boolean().optional(),
});

/**
 * Chat Validation Schema
 */
export const chatMessageSchema = z.object({
  message: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(5000, 'Message must be less than 5000 characters')
    .trim(),
  conversationHistory: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().max(10000),
      })
    )
    .max(50, 'Conversation history too long')
    .optional()
    .default([]),
});

/**
 * Admin Validation Schemas
 */
export const updatePostStatusSchema = z.object({
  status: z.enum(['approved', 'rejected', 'pending']),
  reason: z.string().max(1000).trim().optional(),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(['user', 'admin']),
});

/**
 * Bookmark Validation Schema
 */
export const createBookmarkSchema = z.object({
  type: z.enum(['job', 'article', 'post']),
  itemId: z.string().min(1, 'Item ID is required'),
});

export const toggleBookmarkSchema = z.object({
  type: z.enum(['job', 'article', 'post']),
  itemId: z.string().min(1, 'Item ID is required'),
});

/**
 * 2FA Validation Schemas
 */
export const twoFactorEnableSchema = z.object({
  token: z
    .string()
    .length(6, 'Token must be 6 digits')
    .regex(/^\d{6}$/, 'Token must be 6 digits'),
});

export const twoFactorDisableSchema = z.object({
  token: z
    .string()
    .length(6, 'Token must be 6 digits')
    .regex(/^\d{6}$/, 'Token must be 6 digits'),
});

/**
 * Resume AI Validation Schemas
 */
export const aiEnhanceSchema = z.object({
  text: z
    .string()
    .min(1, 'Text is required')
    .max(10000, 'Text must be less than 10000 characters')
    .trim(),
  type: z.enum(['summary', 'experience', 'education', 'skills', 'custom']),
});

export const aiGenerateFullSchema = z.object({
  prompt: z.string().max(5000).trim().optional(),
  jobDescription: z.string().max(10000).trim().optional(),
  role: z.string().max(200).trim().optional(),
  mode: z.enum(['concise', 'human']).optional().default('human'),
});

/**
 * Payment Validation Schemas
 */
export const createCheckoutSchema = z.object({
  billingCycle: z.enum(['monthly', 'yearly']).optional().default('monthly'),
});

export const paypalOrderSchema = z.object({
  billingCycle: z.enum(['monthly', 'yearly']).optional().default('monthly'),
});

/**
 * Query Validation Helper (for GET request query params)
 */
export const validateQuery = <T extends z.ZodTypeAny>(schema: T) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.query);
      req.query = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          message: error.errors[0]?.message || 'Invalid query parameters',
          errors: error.errors,
        });
        return;
      }
      next(error);
    }
  };
};

import { Request, Response, NextFunction } from 'express';

/**
 * Validation Middleware Helper
 */
export const validate = <T extends z.ZodTypeAny>(schema: T) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          message: error.errors[0]?.message || 'Invalid input',
          errors: error.errors,
        });
        return;
      }
      next(error);
    }
  };
};
