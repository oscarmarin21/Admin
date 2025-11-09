import { describe, it, expect } from '@jest/globals';
import { generateSlug } from '../../src/utils/slug.js';

describe('generateSlug', () => {
  it('converts string to URL-friendly slug', () => {
    expect(generateSlug('My New Organization!')).toBe('my-new-organization');
  });
});

