import { describe, it, expect } from 'vitest';
import {
  normalizeGenotype,
  generatePunnettSquare,
  calculateProbabilities,
  calculateBreedingOutcomes,
  selectOffspring,
  getBirdImagePath,
  isGoalBird,
  getStartingBirds,
  getRandomGoal,
  getRandomStartingBirds,
  isGoalReachable,
  validateGame,
  Bird,
  createBird,
  getPhenotype,
  getPhenotypeAbbreviation,
  getTraitConfig,
  computePhenotypes,
  WING_TRAIT,
  TAIL_TRAIT,
  STANDARD_TRAIT_SET,
  getTraitConfigsForSet,
} from './genetics';

describe('Genetics Utilities', () => {
  // Helper to get standard trait configs
  const standardTraitConfigs = getTraitConfigsForSet('standard');

  describe('getPhenotype', () => {
    describe('wing trait', () => {
      it('returns Large wings for WW', () => {
        expect(getPhenotype(WING_TRAIT, 'WW')).toBe('Large wings');
      });

      it('returns Medium wings for Ww', () => {
        expect(getPhenotype(WING_TRAIT, 'Ww')).toBe('Medium wings');
      });

      it('returns Small wings for ww', () => {
        expect(getPhenotype(WING_TRAIT, 'ww')).toBe('Small wings');
      });
    });

    describe('tail trait', () => {
      it('returns Fan tail for TT', () => {
        expect(getPhenotype(TAIL_TRAIT, 'TT')).toBe('Fan tail');
      });

      it('returns Standard tail for Tt', () => {
        expect(getPhenotype(TAIL_TRAIT, 'Tt')).toBe('Standard tail');
      });

      it('returns Pointed tail for tt', () => {
        expect(getPhenotype(TAIL_TRAIT, 'tt')).toBe('Pointed tail');
      });
    });
  });

  describe('computePhenotypes', () => {
    it('computes phenotypes for all traits', () => {
      const bird: Bird = createBird('1', { wing: 'WW', tail: 'TT' });
      const phenotypes = computePhenotypes(bird, standardTraitConfigs);
      expect(phenotypes['wing']).toBe('Large wings');
      expect(phenotypes['tail']).toBe('Fan tail');
    });

    it('skips traits with missing genotypes', () => {
      const bird: Bird = createBird('1', { wing: 'WW' }); // missing tail
      const phenotypes = computePhenotypes(bird, standardTraitConfigs);
      expect(phenotypes['wing']).toBe('Large wings');
      expect(phenotypes['tail']).toBeUndefined();
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
      const square = generatePunnettSquare('wing', 'Ww', 'Ww');
      expect(square.traitId).toBe('wing');
      expect(square.parent1Alleles).toEqual(['W', 'w']);
      expect(square.parent2Alleles).toEqual(['W', 'w']);
      expect(square.grid).toEqual(['WW', 'Ww', 'Ww', 'ww']);
    });

    it('generates correct square for WW x ww', () => {
      const square = generatePunnettSquare('wing', 'WW', 'ww');
      expect(square.parent1Alleles).toEqual(['W', 'W']);
      expect(square.parent2Alleles).toEqual(['w', 'w']);
      expect(square.grid).toEqual(['Ww', 'Ww', 'Ww', 'Ww']);
    });

    it('generates correct square for TT x Tt', () => {
      const square = generatePunnettSquare('tail', 'TT', 'Tt');
      expect(square.traitId).toBe('tail');
      expect(square.grid).toEqual(['TT', 'Tt', 'TT', 'Tt']);
    });
  });

  describe('calculateProbabilities', () => {
    it('calculates 100% for homozygous x homozygous', () => {
      const square = generatePunnettSquare('wing', 'WW', 'ww');
      const probs = calculateProbabilities(square);
      expect(probs).toEqual([{ genotype: 'Ww', probability: 1, count: 4 }]);
    });

    it('calculates 1:2:1 ratio for heterozygous x heterozygous', () => {
      const square = generatePunnettSquare('wing', 'Ww', 'Ww');
      const probs = calculateProbabilities(square);
      expect(probs).toHaveLength(3);
      expect(probs.find((p) => p.genotype === 'Ww')).toEqual({ genotype: 'Ww', probability: 0.5, count: 2 });
      expect(probs.find((p) => p.genotype === 'WW')).toEqual({ genotype: 'WW', probability: 0.25, count: 1 });
      expect(probs.find((p) => p.genotype === 'ww')).toEqual({ genotype: 'ww', probability: 0.25, count: 1 });
    });

    it('calculates 1:1 ratio for homozygous x heterozygous', () => {
      const square = generatePunnettSquare('tail', 'TT', 'Tt');
      const probs = calculateProbabilities(square);
      expect(probs).toHaveLength(2);
      expect(probs.find((p) => p.genotype === 'TT')).toEqual({ genotype: 'TT', probability: 0.5, count: 2 });
      expect(probs.find((p) => p.genotype === 'Tt')).toEqual({ genotype: 'Tt', probability: 0.5, count: 2 });
    });
  });

  describe('calculateBreedingOutcomes', () => {
    it('calculates combined outcomes for two birds', () => {
      const parent1: Bird = createBird('A', { wing: 'WW', tail: 'tt' });
      const parent2: Bird = createBird('B', { wing: 'ww', tail: 'TT' });

      const outcomes = calculateBreedingOutcomes(parent1, parent2, standardTraitConfigs);

      // WW x ww = 100% Ww, tt x TT = 100% Tt
      expect(outcomes).toHaveLength(1);
      expect(outcomes[0]).toEqual({
        genotypes: { wing: 'Ww', tail: 'Tt' },
        probability: 1,
      });
    });

    it('produces multiple outcomes for heterozygous parents', () => {
      const parent1: Bird = createBird('C', { wing: 'Ww', tail: 'Tt' });
      const parent2: Bird = createBird('D', { wing: 'Ww', tail: 'Tt' });

      const outcomes = calculateBreedingOutcomes(parent1, parent2, standardTraitConfigs);

      // 3 wing outcomes x 3 tail outcomes = 9 combinations
      expect(outcomes).toHaveLength(9);

      // Most likely outcome: Ww (50%) x Tt (50%) = 25%
      expect(outcomes[0].genotypes['wing']).toBe('Ww');
      expect(outcomes[0].genotypes['tail']).toBe('Tt');
      expect(outcomes[0].probability).toBe(0.25);

      // Total probability should be 1
      const total = outcomes.reduce((sum, o) => sum + o.probability, 0);
      expect(total).toBeCloseTo(1);
    });
  });

  describe('selectOffspring', () => {
    it('selects the top 2 highest probability outcomes by default', () => {
      const parent1: Bird = createBird('C', { wing: 'Ww', tail: 'Tt' });
      const parent2: Bird = createBird('D', { wing: 'Ww', tail: 'Tt' });

      const outcomes = calculateBreedingOutcomes(parent1, parent2, standardTraitConfigs);
      const offspring = selectOffspring(outcomes);

      expect(offspring).toHaveLength(2);
      expect(offspring[0]['wing']).toBe('Ww');
      expect(offspring[0]['tail']).toBe('Tt');
    });

    it('respects the count parameter', () => {
      const parent1: Bird = createBird('C', { wing: 'Ww', tail: 'Tt' });
      const parent2: Bird = createBird('D', { wing: 'Ww', tail: 'Tt' });

      const outcomes = calculateBreedingOutcomes(parent1, parent2, standardTraitConfigs);

      expect(selectOffspring(outcomes, 1)).toHaveLength(1);
      expect(selectOffspring(outcomes, 3)).toHaveLength(3);
    });

    it('is deterministic across multiple calls', () => {
      const parent1: Bird = createBird('C', { wing: 'Ww', tail: 'Tt' });
      const parent2: Bird = createBird('D', { wing: 'Ww', tail: 'Tt' });

      const outcomes = calculateBreedingOutcomes(parent1, parent2, standardTraitConfigs);

      const offspring1 = selectOffspring(outcomes);
      const offspring2 = selectOffspring(outcomes);

      expect(offspring1).toEqual(offspring2);
    });
  });

  describe('getBirdImagePath', () => {
    it('generates correct path for WW TT bird (large wings, fan tail)', () => {
      const bird: Bird = createBird('1', { wing: 'WW', tail: 'TT' });
      expect(getBirdImagePath(bird, standardTraitConfigs)).toBe('birds/lwft-WWTT.png');
    });

    it('generates correct path for ww tt bird (small wings, pointed tail)', () => {
      const bird: Bird = createBird('2', { wing: 'ww', tail: 'tt' });
      expect(getBirdImagePath(bird, standardTraitConfigs)).toBe('birds/swpt-wwtt.png');
    });

    it('generates correct path for Ww Tt bird (medium wings, standard tail)', () => {
      const bird: Bird = createBird('3', { wing: 'Ww', tail: 'Tt' });
      expect(getBirdImagePath(bird, standardTraitConfigs)).toBe('birds/mwst-WwTt.png');
    });

    it('returns placeholder for non-standard trait sets', () => {
      const basicTraitConfigs = getTraitConfigsForSet('basic');
      const bird: Bird = createBird('1', { wing: 'WW' });
      expect(getBirdImagePath(bird, basicTraitConfigs)).toBe('birds/placeholder.svg');
    });

    it('returns placeholder when wing genotype is missing', () => {
      const bird: Bird = createBird('1', { tail: 'TT' });
      expect(getBirdImagePath(bird, standardTraitConfigs)).toBe('birds/placeholder.svg');
    });

    it('returns placeholder when tail genotype is missing', () => {
      const bird: Bird = createBird('1', { wing: 'WW' });
      expect(getBirdImagePath(bird, standardTraitConfigs)).toBe('birds/placeholder.svg');
    });
  });

  describe('isGoalBird', () => {
    it('returns true for goal bird', () => {
      const bird: Bird = createBird('1', { wing: 'WW', tail: 'TT' });
      expect(isGoalBird(bird, { wing: 'WW', tail: 'TT' })).toBe(true);
    });

    it('returns false for non-goal bird', () => {
      const bird: Bird = createBird('2', { wing: 'Ww', tail: 'Tt' });
      expect(isGoalBird(bird, { wing: 'WW', tail: 'TT' })).toBe(false);
    });

    it('returns true for goal bird with single trait', () => {
      const bird: Bird = createBird('1', { wing: 'WW' });
      expect(isGoalBird(bird, { wing: 'WW' })).toBe(true);
    });
  });

  describe('getStartingBirds', () => {
    it('returns 4 starting birds for standard trait set', () => {
      const birds = getStartingBirds('standard');
      expect(birds).toHaveLength(4);
    });

    it('returns birds with correct genotypes for standard trait set', () => {
      const birds = getStartingBirds('standard');

      expect(birds[0]).toEqual({ id: 'A', genotypes: { wing: 'WW', tail: 'tt' } });
      expect(birds[1]).toEqual({ id: 'B', genotypes: { wing: 'ww', tail: 'TT' } });
      expect(birds[2]).toEqual({ id: 'C', genotypes: { wing: 'Ww', tail: 'Tt' } });
      expect(birds[3]).toEqual({ id: 'D', genotypes: { wing: 'Ww', tail: 'tt' } });
    });

    it('returns birds with correct genotypes for basic trait set', () => {
      const birds = getStartingBirds('basic');
      expect(birds).toHaveLength(4);
      expect(birds[0]).toEqual({ id: 'A', genotypes: { wing: 'WW' } });
      expect(birds[1]).toEqual({ id: 'B', genotypes: { wing: 'ww' } });
      expect(birds[2]).toEqual({ id: 'C', genotypes: { wing: 'Ww' } });
      expect(birds[3]).toEqual({ id: 'D', genotypes: { wing: 'Ww' } });
    });

    it('returns birds with correct genotypes for advanced trait set', () => {
      const birds = getStartingBirds('advanced');
      expect(birds).toHaveLength(4);
      // Advanced has 3 traits
      expect(Object.keys(birds[0].genotypes)).toHaveLength(3);
      expect(birds[0].genotypes['wing']).toBeDefined();
      expect(birds[0].genotypes['tail']).toBeDefined();
      expect(birds[0].genotypes['crest']).toBeDefined();
    });
  });

  describe('getRandomGoal', () => {
    it('generates a goal with genotypes for all traits in the set', () => {
      const mockRandom = () => 0.5;
      const goal = getRandomGoal('standard', mockRandom);

      expect(goal['wing']).toBeDefined();
      expect(goal['tail']).toBeDefined();
      expect(['WW', 'Ww', 'ww']).toContain(goal['wing']);
      expect(['TT', 'Tt', 'tt']).toContain(goal['tail']);
    });

    it('uses random function to select genotypes', () => {
      // When random returns 0, should select first genotype (WW, TT)
      const lowRandom = () => 0;
      const lowGoal = getRandomGoal('standard', lowRandom);
      expect(lowGoal['wing']).toBe('WW');
      expect(lowGoal['tail']).toBe('TT');

      // When random returns 0.99, should select last genotype (ww, tt)
      const highRandom = () => 0.99;
      const highGoal = getRandomGoal('standard', highRandom);
      expect(highGoal['wing']).toBe('ww');
      expect(highGoal['tail']).toBe('tt');
    });

    it('works with basic trait set', () => {
      const goal = getRandomGoal('basic', () => 0);
      expect(goal['wing']).toBe('WW');
      expect(goal['tail']).toBeUndefined();
    });
  });

  describe('getRandomStartingBirds', () => {
    it('generates 4 birds that do not match the goal', () => {
      const goal = { wing: 'WW', tail: 'TT' };
      let callCount = 0;
      const mockRandom = () => {
        callCount++;
        return (callCount % 3) * 0.4; // Cycle through 0, 0.4, 0.8
      };

      const birds = getRandomStartingBirds(goal, 'standard', mockRandom);

      expect(birds).toHaveLength(4);
      birds.forEach((bird) => {
        // Each bird should not match the goal
        const matchesGoal =
          bird.genotypes['wing'] === goal['wing'] && bird.genotypes['tail'] === goal['tail'];
        expect(matchesGoal).toBe(false);
      });
    });

    it('assigns unique IDs A, B, C, D', () => {
      const goal = { wing: 'WW', tail: 'TT' };
      const birds = getRandomStartingBirds(goal, 'standard', () => 0.5);

      expect(birds.map((b) => b.id)).toEqual(['A', 'B', 'C', 'D']);
    });
  });

  describe('error handling', () => {
    describe('getTraitConfigsForSet', () => {
      it('throws error for unknown trait set', () => {
        expect(() => getTraitConfigsForSet('nonexistent')).toThrow('Unknown trait set: nonexistent');
      });
    });

    describe('getTraitConfig', () => {
      it('throws error for unknown trait', () => {
        expect(() => getTraitConfig('nonexistent')).toThrow('Unknown trait: nonexistent');
      });

      it('returns trait config for valid trait', () => {
        const config = getTraitConfig('wing');
        expect(config.id).toBe('wing');
        expect(config.displayName).toBe('Wing Size');
      });
    });

    describe('getPhenotype', () => {
      it('throws error for unknown genotype', () => {
        expect(() => getPhenotype(WING_TRAIT, 'XX')).toThrow(
          "Unknown genotype 'XX' for trait 'wing'"
        );
      });
    });

    describe('getPhenotypeAbbreviation', () => {
      it('throws error for unknown genotype', () => {
        expect(() => getPhenotypeAbbreviation(WING_TRAIT, 'XX')).toThrow(
          "Unknown genotype 'XX' for trait 'wing'"
        );
      });

      it('returns abbreviation for valid genotype', () => {
        expect(getPhenotypeAbbreviation(WING_TRAIT, 'WW')).toBe('lw');
        expect(getPhenotypeAbbreviation(WING_TRAIT, 'Ww')).toBe('mw');
        expect(getPhenotypeAbbreviation(WING_TRAIT, 'ww')).toBe('sw');
      });
    });
  });

  describe('Game Validation', () => {
    describe('isGoalReachable', () => {
      it('returns true when goal is already in starting birds', () => {
        const birds = [
          createBird('A', { wing: 'WW', tail: 'TT' }),
          createBird('B', { wing: 'ww', tail: 'tt' }),
        ];
        const goal = { wing: 'WW', tail: 'TT' };

        expect(isGoalReachable(birds, goal, standardTraitConfigs)).toBe(true);
      });

      it('returns true when goal is reachable in one generation', () => {
        // Ww x Ww can produce WW
        const birds = [
          createBird('A', { wing: 'Ww', tail: 'TT' }),
          createBird('B', { wing: 'Ww', tail: 'TT' }),
        ];
        const goal = { wing: 'WW', tail: 'TT' };

        expect(isGoalReachable(birds, goal, standardTraitConfigs)).toBe(true);
      });

      it('returns true when goal requires multiple generations', () => {
        // Start with WW,tt and ww,TT -> can get Ww,Tt -> can eventually get WW,TT
        const birds = [
          createBird('A', { wing: 'WW', tail: 'tt' }),
          createBird('B', { wing: 'ww', tail: 'TT' }),
        ];
        const goal = { wing: 'WW', tail: 'TT' };

        expect(isGoalReachable(birds, goal, standardTraitConfigs)).toBe(true);
      });

      it('returns false when goal requires allele not present', () => {
        // Only have WW - cannot produce ww
        const birds = [
          createBird('A', { wing: 'WW', tail: 'TT' }),
          createBird('B', { wing: 'WW', tail: 'Tt' }),
        ];
        const goal = { wing: 'ww', tail: 'TT' };

        expect(isGoalReachable(birds, goal, standardTraitConfigs)).toBe(false);
      });

      it('returns false when goal requires recessive allele not present', () => {
        // Only have TT - cannot produce tt
        const birds = [
          createBird('A', { wing: 'Ww', tail: 'TT' }),
          createBird('B', { wing: 'Ww', tail: 'TT' }),
        ];
        const goal = { wing: 'WW', tail: 'tt' };

        expect(isGoalReachable(birds, goal, standardTraitConfigs)).toBe(false);
      });

      it('respects maxGenerations limit', () => {
        const birds = [
          createBird('A', { wing: 'WW', tail: 'tt' }),
          createBird('B', { wing: 'ww', tail: 'TT' }),
        ];
        const goal = { wing: 'WW', tail: 'TT' };

        // With 0 max generations, goal is not in starting set
        expect(isGoalReachable(birds, goal, standardTraitConfigs, 0)).toBe(false);

        // With enough generations, it should be reachable
        expect(isGoalReachable(birds, goal, standardTraitConfigs, 10)).toBe(true);
      });

      it('works with single-trait configurations', () => {
        const basicTraitConfigs = getTraitConfigsForSet('basic');
        const birds = [
          createBird('A', { wing: 'Ww' }),
          createBird('B', { wing: 'Ww' }),
        ];

        expect(isGoalReachable(birds, { wing: 'WW' }, basicTraitConfigs)).toBe(true);
        expect(isGoalReachable(birds, { wing: 'ww' }, basicTraitConfigs)).toBe(true);
        expect(isGoalReachable(birds, { wing: 'Ww' }, basicTraitConfigs)).toBe(true);
      });
    });

    describe('validateGame', () => {
      it('returns validation result with details', () => {
        const birds = [
          createBird('A', { wing: 'Ww', tail: 'Tt' }),
          createBird('B', { wing: 'Ww', tail: 'Tt' }),
        ];
        const goal = { wing: 'WW', tail: 'TT' };

        const result = validateGame(birds, goal, standardTraitConfigs);

        expect(result.isValid).toBe(true);
        expect(result.generationsExplored).toBeGreaterThanOrEqual(0);
        expect(result.genotypesDiscovered).toBeGreaterThan(0);
      });

      it('reports failure with details when goal is unreachable', () => {
        const birds = [
          createBird('A', { wing: 'WW', tail: 'TT' }),
          createBird('B', { wing: 'WW', tail: 'TT' }),
        ];
        const goal = { wing: 'ww', tail: 'tt' };

        const result = validateGame(birds, goal, standardTraitConfigs);

        expect(result.isValid).toBe(false);
        expect(result.generationsExplored).toBe(0); // Fast reject
      });

      it('validates the standard starting birds can reach any goal', () => {
        const birds = getStartingBirds('standard');
        const allGenotypes = ['WW', 'Ww', 'ww'];
        const allTails = ['TT', 'Tt', 'tt'];

        // Standard starting birds should be able to reach any combination
        for (const wing of allGenotypes) {
          for (const tail of allTails) {
            const goal = { wing, tail };
            const result = validateGame(birds, goal, standardTraitConfigs);
            expect(result.isValid).toBe(true);
          }
        }
      });
    });
  });
});
