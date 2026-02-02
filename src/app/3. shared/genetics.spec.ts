import { describe, it, expect } from 'vitest';
import {
  getWingPhenotype,
  getTailPhenotype,
  normalizeGenotype,
  generatePunnettSquare,
  calculateProbabilities,
  calculateBreedingOutcomes,
  selectOffspring,
  getPigeonImagePath,
  isGoalPigeon,
  getStartingPigeons,
  GOAL_WING_GENOTYPE,
  GOAL_TAIL_GENOTYPE,
  Pigeon,
} from './genetics';

describe('Genetics Utilities', () => {
  describe('getWingPhenotype', () => {
    it('returns Large wings for WW', () => {
      expect(getWingPhenotype('WW')).toBe('Large wings');
    });

    it('returns Medium wings for Ww', () => {
      expect(getWingPhenotype('Ww')).toBe('Medium wings');
    });

    it('returns Small wings for ww', () => {
      expect(getWingPhenotype('ww')).toBe('Small wings');
    });
  });

  describe('getTailPhenotype', () => {
    it('returns Fan tail for TT', () => {
      expect(getTailPhenotype('TT')).toBe('Fan tail');
    });

    it('returns Standard tail for Tt', () => {
      expect(getTailPhenotype('Tt')).toBe('Standard tail');
    });

    it('returns Pointed tail for tt', () => {
      expect(getTailPhenotype('tt')).toBe('Pointed tail');
    });
  });

  describe('normalizeGenotype', () => {
    it('keeps uppercase first when already correct', () => {
      expect(normalizeGenotype('W', 'w')).toBe('Ww');
    });

    it('swaps to put uppercase first', () => {
      expect(normalizeGenotype('w', 'W')).toBe('Ww');
    });

    it('handles homozygous dominant', () => {
      expect(normalizeGenotype('W', 'W')).toBe('WW');
    });

    it('handles homozygous recessive', () => {
      expect(normalizeGenotype('t', 't')).toBe('tt');
    });

    it('sorts alphabetically when both same case (uppercase)', () => {
      expect(normalizeGenotype('W', 'T')).toBe('TW');
    });

    it('sorts alphabetically when both same case (lowercase)', () => {
      expect(normalizeGenotype('w', 't')).toBe('tw');
    });
  });

  describe('generatePunnettSquare', () => {
    it('generates correct square for Ww x Ww', () => {
      const square = generatePunnettSquare('Ww', 'Ww');
      expect(square.parent1Alleles).toEqual(['W', 'w']);
      expect(square.parent2Alleles).toEqual(['W', 'w']);
      expect(square.grid).toEqual(['WW', 'Ww', 'Ww', 'ww']);
    });

    it('generates correct square for WW x ww', () => {
      const square = generatePunnettSquare('WW', 'ww');
      expect(square.parent1Alleles).toEqual(['W', 'W']);
      expect(square.parent2Alleles).toEqual(['w', 'w']);
      expect(square.grid).toEqual(['Ww', 'Ww', 'Ww', 'Ww']);
    });

    it('generates correct square for TT x Tt', () => {
      const square = generatePunnettSquare('TT', 'Tt');
      expect(square.grid).toEqual(['TT', 'Tt', 'TT', 'Tt']);
    });
  });

  describe('calculateProbabilities', () => {
    it('calculates 100% for homozygous x homozygous', () => {
      const square = generatePunnettSquare('WW', 'ww');
      const probs = calculateProbabilities(square);
      expect(probs).toEqual([{ genotype: 'Ww', probability: 1, count: 4 }]);
    });

    it('calculates 1:2:1 ratio for heterozygous x heterozygous', () => {
      const square = generatePunnettSquare('Ww', 'Ww');
      const probs = calculateProbabilities(square);
      expect(probs).toHaveLength(3);
      expect(probs.find((p) => p.genotype === 'Ww')).toEqual({ genotype: 'Ww', probability: 0.5, count: 2 });
      expect(probs.find((p) => p.genotype === 'WW')).toEqual({ genotype: 'WW', probability: 0.25, count: 1 });
      expect(probs.find((p) => p.genotype === 'ww')).toEqual({ genotype: 'ww', probability: 0.25, count: 1 });
    });

    it('calculates 1:1 ratio for homozygous x heterozygous', () => {
      const square = generatePunnettSquare('TT', 'Tt');
      const probs = calculateProbabilities(square);
      expect(probs).toHaveLength(2);
      expect(probs.find((p) => p.genotype === 'TT')).toEqual({ genotype: 'TT', probability: 0.5, count: 2 });
      expect(probs.find((p) => p.genotype === 'Tt')).toEqual({ genotype: 'Tt', probability: 0.5, count: 2 });
    });
  });

  describe('calculateBreedingOutcomes', () => {
    it('calculates combined outcomes for two pigeons', () => {
      const parent1: Pigeon = { id: 'A', wingGenotype: 'WW', tailGenotype: 'tt' };
      const parent2: Pigeon = { id: 'B', wingGenotype: 'ww', tailGenotype: 'TT' };

      const outcomes = calculateBreedingOutcomes(parent1, parent2);

      // WW x ww = 100% Ww, tt x TT = 100% Tt
      expect(outcomes).toHaveLength(1);
      expect(outcomes[0]).toEqual({
        wingGenotype: 'Ww',
        tailGenotype: 'Tt',
        probability: 1,
      });
    });

    it('produces multiple outcomes for heterozygous parents', () => {
      const parent1: Pigeon = { id: 'C', wingGenotype: 'Ww', tailGenotype: 'Tt' };
      const parent2: Pigeon = { id: 'D', wingGenotype: 'Ww', tailGenotype: 'Tt' };

      const outcomes = calculateBreedingOutcomes(parent1, parent2);

      // 3 wing outcomes x 3 tail outcomes = 9 combinations
      expect(outcomes).toHaveLength(9);

      // Most likely outcome: Ww (50%) x Tt (50%) = 25%
      expect(outcomes[0].wingGenotype).toBe('Ww');
      expect(outcomes[0].tailGenotype).toBe('Tt');
      expect(outcomes[0].probability).toBe(0.25);

      // Total probability should be 1
      const total = outcomes.reduce((sum, o) => sum + o.probability, 0);
      expect(total).toBeCloseTo(1);
    });
  });

  describe('selectOffspring', () => {
    it('selects the top 2 highest probability outcomes by default', () => {
      const parent1: Pigeon = { id: 'C', wingGenotype: 'Ww', tailGenotype: 'Tt' };
      const parent2: Pigeon = { id: 'D', wingGenotype: 'Ww', tailGenotype: 'Tt' };

      const outcomes = calculateBreedingOutcomes(parent1, parent2);
      const offspring = selectOffspring(outcomes);

      expect(offspring).toHaveLength(2);
      expect(offspring[0].wingGenotype).toBe('Ww');
      expect(offspring[0].tailGenotype).toBe('Tt');
    });

    it('respects the count parameter', () => {
      const parent1: Pigeon = { id: 'C', wingGenotype: 'Ww', tailGenotype: 'Tt' };
      const parent2: Pigeon = { id: 'D', wingGenotype: 'Ww', tailGenotype: 'Tt' };

      const outcomes = calculateBreedingOutcomes(parent1, parent2);

      expect(selectOffspring(outcomes, 1)).toHaveLength(1);
      expect(selectOffspring(outcomes, 3)).toHaveLength(3);
    });

    it('is deterministic across multiple calls', () => {
      const parent1: Pigeon = { id: 'C', wingGenotype: 'Ww', tailGenotype: 'Tt' };
      const parent2: Pigeon = { id: 'D', wingGenotype: 'Ww', tailGenotype: 'Tt' };

      const outcomes = calculateBreedingOutcomes(parent1, parent2);

      const offspring1 = selectOffspring(outcomes);
      const offspring2 = selectOffspring(outcomes);

      expect(offspring1).toEqual(offspring2);
    });
  });

  describe('getPigeonImagePath', () => {
    it('generates correct path for WW TT pigeon (large wings, fan tail)', () => {
      const pigeon: Pigeon = { id: '1', wingGenotype: 'WW', tailGenotype: 'TT' };
      expect(getPigeonImagePath(pigeon)).toBe('pigeons/lwft-WWTT.png');
    });

    it('generates correct path for ww tt pigeon (small wings, pointed tail)', () => {
      const pigeon: Pigeon = { id: '2', wingGenotype: 'ww', tailGenotype: 'tt' };
      expect(getPigeonImagePath(pigeon)).toBe('pigeons/swpt-wwtt.png');
    });

    it('generates correct path for Ww Tt pigeon (medium wings, standard tail)', () => {
      const pigeon: Pigeon = { id: '3', wingGenotype: 'Ww', tailGenotype: 'Tt' };
      expect(getPigeonImagePath(pigeon)).toBe('pigeons/mwst-WwTt.png');
    });
  });

  describe('isGoalPigeon', () => {
    it('returns true for goal pigeon', () => {
      const pigeon: Pigeon = { id: '1', wingGenotype: 'WW', tailGenotype: 'TT' };
      expect(isGoalPigeon(pigeon, GOAL_WING_GENOTYPE, GOAL_TAIL_GENOTYPE)).toBe(true);
    });

    it('returns false for non-goal pigeon', () => {
      const pigeon: Pigeon = { id: '2', wingGenotype: 'Ww', tailGenotype: 'Tt' };
      expect(isGoalPigeon(pigeon, GOAL_WING_GENOTYPE, GOAL_TAIL_GENOTYPE)).toBe(false);
    });
  });

  describe('getStartingPigeons', () => {
    it('returns 4 starting pigeons', () => {
      const pigeons = getStartingPigeons();
      expect(pigeons).toHaveLength(4);
    });

    it('returns pigeons with correct genotypes per spec', () => {
      const pigeons = getStartingPigeons();

      expect(pigeons[0]).toEqual({ id: 'A', wingGenotype: 'WW', tailGenotype: 'tt' });
      expect(pigeons[1]).toEqual({ id: 'B', wingGenotype: 'ww', tailGenotype: 'TT' });
      expect(pigeons[2]).toEqual({ id: 'C', wingGenotype: 'Ww', tailGenotype: 'Tt' });
      expect(pigeons[3]).toEqual({ id: 'D', wingGenotype: 'Ww', tailGenotype: 'tt' });
    });
  });
});
