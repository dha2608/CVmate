/**
 * Shared validation utilities
 * Used across form components to ensure consistent validation
 */

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// URL validation regex
const URL_REGEX = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;

/**
 * Validates email format
 */
export const validateEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  return EMAIL_REGEX.test(email.trim());
};

/**
 * Validates URL format
 */
export const validateUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return true; // URL is optional
  const trimmed = url.trim();
  if (trimmed === '') return true; // Empty is valid (optional field)
  return URL_REGEX.test(trimmed);
};

/**
 * Validates phone number (basic validation)
 */
export const validatePhone = (phone: string): boolean => {
  if (!phone || typeof phone !== 'string') return true; // Phone is optional
  const trimmed = phone.trim();
  if (trimmed === '') return true; // Empty is valid (optional field)
  // Allow digits, spaces, dashes, parentheses, plus sign
  return /^[\d\s\-\(\)\+]+$/.test(trimmed);
};

/**
 * Validates required field
 */
export const validateRequired = (value: string | undefined | null): boolean => {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return false;
};

/**
 * Validates field is not only numbers (for job titles, names, etc.)
 */
export const validateNotOnlyNumbers = (value: string): boolean => {
  if (!value || typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (trimmed === '') return false;
  // Check if value consists only of digits
  return !/^\d+$/.test(trimmed);
};

/**
 * Validates salary format (allows numbers, commas, dots, dashes, spaces, currency symbols)
 */
export const validateSalary = (salary: string): boolean => {
  if (!salary || typeof salary !== 'string') return true; // Salary is optional
  const trimmed = salary.trim();
  if (trimmed === '') return true; // Empty is valid (optional field)
  // Allow numbers, commas, dots, dashes, spaces, and currency symbols
  return /^[\d\s,.\-€$£¥₹]+$/.test(trimmed);
};

/**
 * Validates text length
 */
export const validateLength = (
  value: string,
  min: number,
  max?: number
): boolean => {
  if (!value || typeof value !== 'string') return false;
  const length = value.trim().length;
  if (length < min) return false;
  if (max !== undefined && length > max) return false;
  return true;
};

/**
 * Validates date format (basic YYYY-MM-DD or MM/YYYY)
 */
export const validateDate = (date: string): boolean => {
  if (!date || typeof date !== 'string') return true; // Date is optional
  const trimmed = date.trim();
  if (trimmed === '') return true; // Empty is valid (optional field)
  // Allow various date formats
  return /^(\d{4}-\d{2}-\d{2}|\d{2}\/\d{4}|\d{2}\/\d{2}\/\d{4}|\d{4})$/.test(trimmed);
};

/**
 * Validates array is not empty
 */
export const validateArrayNotEmpty = <T>(arr: T[]): boolean => {
  return Array.isArray(arr) && arr.length > 0;
};

/**
 * Validates no duplicate values in array
 */
export const validateNoDuplicates = <T>(arr: T[]): boolean => {
  if (!Array.isArray(arr)) return false;
  const unique = new Set(arr);
  return unique.size === arr.length;
};

/**
 * Validates skill format (no duplicates, max length)
 */
export const validateSkill = (skill: string, existingSkills: string[]): { valid: boolean; error?: string } => {
  if (!skill || typeof skill !== 'string') {
    return { valid: false, error: 'Skill cannot be empty' };
  }
  
  const trimmed = skill.trim();
  
  if (trimmed.length === 0) {
    return { valid: false, error: 'Skill cannot be empty' };
  }
  
  if (trimmed.length > 50) {
    return { valid: false, error: 'Skill must be 50 characters or less' };
  }
  
  const normalized = trimmed.toLowerCase();
  if (existingSkills.some(s => s.toLowerCase() === normalized)) {
    return { valid: false, error: 'This skill already exists' };
  }
  
  return { valid: true };
};

/**
 * Validates experience/education entry
 */
export interface ExperienceEducationEntry {
  company?: string;
  position?: string;
  institution?: string;
  degree?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export const validateExperienceEntry = (entry: ExperienceEducationEntry): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!entry.company?.trim() && !entry.position?.trim()) {
    errors.push('Company or Position is required');
  }
  
  if (!entry.position?.trim()) {
    errors.push('Position is required');
  }
  
  if (!entry.company?.trim()) {
    errors.push('Company is required');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
};

export const validateEducationEntry = (entry: ExperienceEducationEntry): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!entry.institution?.trim()) {
    errors.push('Institution is required');
  }
  
  if (!entry.degree?.trim()) {
    errors.push('Degree is required');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validates job posting form
 */
export interface JobPostingData {
  title: string;
  company: string;
  description: string;
  salary?: string;
  location?: string;
  type?: string;
}

export const validateJobPosting = (data: JobPostingData): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!validateRequired(data.title)) {
    errors.push('Job title is required');
  } else if (!validateNotOnlyNumbers(data.title)) {
    errors.push('Job title cannot be only numbers');
  }
  
  if (!validateRequired(data.company)) {
    errors.push('Company name is required');
  }
  
  if (!validateRequired(data.description)) {
    errors.push('Job description is required');
  }
  
  if (data.salary && !validateSalary(data.salary)) {
    errors.push('Invalid salary format');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validates personal information
 */
export interface PersonalInfoData {
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  linkedin?: string;
  website?: string;
}

export const validatePersonalInfo = (data: PersonalInfoData): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!validateRequired(data.fullName)) {
    errors.push('Full name is required');
  }
  
  if (!validateRequired(data.email)) {
    errors.push('Email is required');
  } else if (!validateEmail(data.email)) {
    errors.push('Invalid email format');
  }
  
  if (data.phone && !validatePhone(data.phone)) {
    errors.push('Invalid phone number format');
  }
  
  if (data.linkedin && !validateUrl(data.linkedin)) {
    errors.push('Invalid LinkedIn URL');
  }
  
  if (data.website && !validateUrl(data.website)) {
    errors.push('Invalid website URL');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Sanitize string input (trim and remove extra spaces)
 */
export const sanitizeString = (value: string | undefined | null): string => {
  if (!value || typeof value !== 'string') return '';
  return value.trim().replace(/\s+/g, ' ');
};

/**
 * Sanitize array of strings
 */
export const sanitizeStringArray = (arr: (string | undefined | null)[]): string[] => {
  if (!Array.isArray(arr)) return [];
  return arr
    .map(item => sanitizeString(item))
    .filter(item => item.length > 0);
};
