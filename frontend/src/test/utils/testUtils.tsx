/**
 * Test Utilities
 * Helper functions for testing React components
 */

import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

/**
 * Custom render function with providers
 */
export const renderWithProviders = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return <BrowserRouter>{children}</BrowserRouter>;
  };

  return render(ui, { wrapper: Wrapper, ...options });
};

/**
 * Mock API response helper
 */
export const mockApiResponse = <T,>(data: T, success = true) => ({
  success,
  data,
  message: success ? 'Success' : 'Error',
});

/**
 * Wait for async operations
 */
export const waitForAsync = () => new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Mock user data
 */
export const mockUser = {
  _id: 'test-user-id',
  name: 'Test User',
  email: 'test@example.com',
  role: 'user' as const,
  token: 'test-token',
  avatar: 'https://example.com/avatar.jpg',
  onboardingCompleted: true,
};

/**
 * Mock resume data
 */
export const mockResume = {
  _id: 'test-resume-id',
  user: 'test-user-id',
  title: 'Test Resume',
  personalInfo: {
    fullName: 'Test User',
    email: 'test@example.com',
    phone: '1234567890',
  },
  summary: 'Test summary',
  experience: [],
  education: [],
  skills: ['JavaScript', 'TypeScript'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
