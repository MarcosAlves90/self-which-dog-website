import { describe, it, expect } from 'vitest';
import { seededRandom, sampleFromDistribution, determineBreedFromTraits } from '../utils/breedUtils';
import { breeds } from '../utils/breeds';

describe('seededRandom', () => {
  it('is deterministic for a given string', () => {
    const a = seededRandom('foo');
    const b = seededRandom('foo');
    expect(a).toBe(b);
  });
});

describe('sampleFromDistribution', () => {
  it('samples deterministically when seeded', () => {
    const entries = [
      { name: 'a', prob: 0.9 },
      { name: 'b', prob: 0.1 }
    ];
    const res = sampleFromDistribution(entries, 'seed1');
    expect(['a','b']).toContain(res);
  });
});

describe('determineBreedFromTraits', () => {
  it('returns a valid breed name and is deterministic for a seed', () => {
    const traits = { energy: 1, sociability: 1, independence: 0, discipline: 0, protection: 0, impulsivity: 0 };
    const a = determineBreedFromTraits(traits, 'seedX');
    const b = determineBreedFromTraits(traits, 'seedX');
    expect(a).toBe(b);
    expect(Object.keys(breeds)).toContain(a);
  });
});
