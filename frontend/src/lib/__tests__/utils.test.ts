/**
 * Utils Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { cn } from '../utils';

describe('utils', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      expect(cn('foo', 'bar')).toBe('foo bar');
    });

    it('should handle conditional classes', () => {
      expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
    });

    it('should handle undefined and null', () => {
      expect(cn('foo', undefined, null, 'bar')).toBe('foo bar');
    });

    it('should merge Tailwind classes correctly', () => {
      expect(cn('px-2 py-1', 'px-4')).toBe('px-4 py-1');
    });
  });
});
