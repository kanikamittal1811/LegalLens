import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('utils', () => {
  describe('cn (classNames helper)', () => {
    it('combines class names correctly', () => {
      const result = cn('font-bold', 'text-white', 'p-4');
      expect(result).toContain('font-bold');
      expect(result).toContain('text-white');
      expect(result).toContain('p-4');
    });

    it('handles conditional class names and falsy values', () => {
      const isVisible = false;
      const isActive = true;
      const result = cn('base-class', isVisible && 'hidden', isActive && 'active-class');
      expect(result).toContain('base-class');
      expect(result).toContain('active-class');
      expect(result).not.toContain('hidden');
    });
  });
});
