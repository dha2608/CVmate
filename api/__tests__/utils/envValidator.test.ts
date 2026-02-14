/**
 * Environment Validator Tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { validateEnv, validateFeatureConfig, getEnvReport } from '../../utils/envValidator.js';

describe('envValidator', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset process.env
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('validateEnv', () => {
    it('should pass with required variables', () => {
      process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
      process.env.JWT_SECRET = 'test-secret-key-minimum-32-characters-long';

      const result = validateEnv();
      expect(result.isValid).toBe(true);
      expect(result.missing).toHaveLength(0);
    });

    it('should fail without MONGODB_URI', () => {
      delete process.env.MONGODB_URI;
      delete process.env.MONGO_URI;
      process.env.JWT_SECRET = 'test-secret-key-minimum-32-characters-long';

      const result = validateEnv();
      expect(result.isValid).toBe(false);
      expect(result.missing.length).toBeGreaterThan(0);
    });

    it('should fail without JWT_SECRET', () => {
      process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
      delete process.env.JWT_SECRET;

      const result = validateEnv();
      expect(result.isValid).toBe(false);
      expect(result.missing).toContain('JWT_SECRET');
    });

    it('should warn if JWT_SECRET is too short', () => {
      process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
      process.env.JWT_SECRET = 'short';

      const result = validateEnv();
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.key === 'JWT_SECRET')).toBe(true);
    });
  });

  describe('validateFeatureConfig', () => {
    it('should validate AI feature config', () => {
      process.env.HF_API_KEY = 'test-key';
      const result = validateFeatureConfig('ai');
      expect(result.available).toBe(true);
      expect(result.missing).toHaveLength(0);
    });

    it('should detect missing AI config', () => {
      delete process.env.HF_API_KEY;
      const result = validateFeatureConfig('ai');
      expect(result.available).toBe(false);
      expect(result.missing).toContain('HF_API_KEY');
    });

    it('should validate payment feature config', () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123';
      const result = validateFeatureConfig('payment');
      expect(result.available).toBe(true);
    });

    it('should validate OAuth feature config', () => {
      process.env.GOOGLE_CLIENT_ID = 'test-client-id';
      process.env.GOOGLE_CLIENT_SECRET = 'test-secret';
      const result = validateFeatureConfig('oauth');
      expect(result.available).toBe(true);
    });
  });

  describe('getEnvReport', () => {
    it('should generate comprehensive report', () => {
      process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
      process.env.JWT_SECRET = 'test-secret-key-minimum-32-characters-long';
      process.env.HF_API_KEY = 'test-key';

      const report = getEnvReport();
      expect(report.isValid).toBe(true);
      expect(report.features).toBeDefined();
      expect(report.features.ai).toBeDefined();
      expect(report.features.payment).toBeDefined();
    });
  });
});
