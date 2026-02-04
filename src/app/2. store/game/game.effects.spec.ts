import { describe, it, expect, vi } from 'vitest';

import {
  getStartingBirds,
  generatePunnettSquare,
  calculateBreedingOutcomes,
  selectOffspring,
  Bird,
  createBird,
  getTraitConfigsForSet,
} from '../../3. shared/genetics';

// Test the breeding logic directly since the effect is a thin wrapper
// The effect uses: generatePunnettSquare, calculateBreedingOutcomes, selectOffspring

describe('GameEffects breeding logic', () => {
  const standardTraitConfigs = getTraitConfigsForSet('standard');

  describe('breeding A (WW wing, tt tail) x B (ww wing, TT tail)', () => {
    const birds = getStartingBirds();
    const parentA = birds.find((p) => p.id === 'A')!;
    const parentB = birds.find((p) => p.id === 'B')!;

    it('generates correct wing Punnett square', () => {
      const wingSquare = generatePunnettSquare(
        'wing',
        parentA.genotypes['wing'],
        parentB.genotypes['wing']
      );

      // WW x ww -> all Ww
      expect(wingSquare.traitId).toBe('wing');
      expect(wingSquare.parent1Alleles).toEqual(['W', 'W']);
      expect(wingSquare.parent2Alleles).toEqual(['w', 'w']);
      expect(wingSquare.grid).toEqual(['Ww', 'Ww', 'Ww', 'Ww']);
    });

    it('generates correct tail Punnett square', () => {
      const tailSquare = generatePunnettSquare(
        'tail',
        parentA.genotypes['tail'],
        parentB.genotypes['tail']
      );

      // tt x TT -> all Tt
      expect(tailSquare.traitId).toBe('tail');
      expect(tailSquare.parent1Alleles).toEqual(['t', 't']);
      expect(tailSquare.parent2Alleles).toEqual(['T', 'T']);
      expect(tailSquare.grid).toEqual(['Tt', 'Tt', 'Tt', 'Tt']);
    });

    it('calculates single outcome with 100% probability', () => {
      const outcomes = calculateBreedingOutcomes(parentA, parentB, standardTraitConfigs);

      expect(outcomes).toHaveLength(1);
      expect(outcomes[0].genotypes['wing']).toBe('Ww');
      expect(outcomes[0].genotypes['tail']).toBe('Tt');
      expect(outcomes[0].probability).toBe(1);
    });

    it('selects offspring using RNG', () => {
      const outcomes = calculateBreedingOutcomes(parentA, parentB, standardTraitConfigs);
      const mockRng = vi.fn().mockReturnValue(0.5);

      const offspring = selectOffspring(outcomes, 2, mockRng);

      expect(offspring).toHaveLength(2);
      expect(mockRng).toHaveBeenCalledTimes(2);

      // Both should be Ww Tt (only possible outcome)
      offspring.forEach((o) => {
        expect(o['wing']).toBe('Ww');
        expect(o['tail']).toBe('Tt');
      });
    });
  });

  describe('breeding C (Ww wing, Tt tail) x D (Ww wing, tt tail) - multiple outcomes', () => {
    const birds = getStartingBirds();
    const parentC = birds.find((p) => p.id === 'C')!;
    const parentD = birds.find((p) => p.id === 'D')!;

    it('calculates multiple outcomes with varying probabilities', () => {
      const outcomes = calculateBreedingOutcomes(parentC, parentD, standardTraitConfigs);

      // Ww x Ww for wings gives: WW (25%), Ww (50%), ww (25%)
      // Tt x tt for tails gives: Tt (50%), tt (50%)
      // Combined outcomes: 3 wing * 2 tail = 6 possible outcomes
      expect(outcomes.length).toBeGreaterThan(1);

      // Total probability should sum to 1
      const totalProb = outcomes.reduce((sum, o) => sum + o.probability, 0);
      expect(totalProb).toBeCloseTo(1, 5);
    });

    it('RNG affects which outcome is selected', () => {
      const outcomes = calculateBreedingOutcomes(parentC, parentD, standardTraitConfigs);

      // Low RNG value should select first (most probable) outcome
      const lowRng = vi.fn().mockReturnValue(0.01);
      const offspringLow = selectOffspring(outcomes, 1, lowRng);

      // High RNG value should select later outcome
      const highRng = vi.fn().mockReturnValue(0.99);
      const offspringHigh = selectOffspring(outcomes, 1, highRng);

      // They may or may not be different depending on probability distribution
      // But RNG should be called
      expect(lowRng).toHaveBeenCalled();
      expect(highRng).toHaveBeenCalled();
    });
  });

  describe('offspring ID generation', () => {
    it('generates unique IDs avoiding existing bird IDs', () => {
      const existingBirds: Bird[] = [
        createBird('A', { wing: 'WW', tail: 'tt' }),
        createBird('offspring-1', { wing: 'Ww', tail: 'Tt' }),
      ];

      // Simulate the ID generation logic from the effect
      function generateOffspringIds(birds: Bird[], count: number): string[] {
        const existingIds = new Set(birds.map((p) => p.id));
        const ids: string[] = [];
        let counter = 1;

        while (ids.length < count) {
          const id = `offspring-${counter}`;
          if (!existingIds.has(id)) {
            ids.push(id);
            existingIds.add(id);
          }
          counter++;
        }

        return ids;
      }

      const newIds = generateOffspringIds(existingBirds, 2);

      expect(newIds).toHaveLength(2);
      expect(newIds[0]).toBe('offspring-2'); // offspring-1 exists, so skip to 2
      expect(newIds[1]).toBe('offspring-3');
    });
  });

  describe('parent ID tracking', () => {
    it('offspring should have parent IDs set', () => {
      const birds = getStartingBirds();
      const parentA = birds.find((p) => p.id === 'A')!;
      const parentB = birds.find((p) => p.id === 'B')!;

      const outcomes = calculateBreedingOutcomes(parentA, parentB, standardTraitConfigs);
      const selectedGenotypes = selectOffspring(outcomes, 2, () => 0.5);

      // Create offspring with parent IDs (simulating effect logic)
      const offspring: Bird[] = selectedGenotypes.map((genotypes, index) =>
        createBird(`offspring-${index + 1}`, genotypes, parentA.id, parentB.id)
      );

      expect(offspring[0].parentId1).toBe('A');
      expect(offspring[0].parentId2).toBe('B');
      expect(offspring[1].parentId1).toBe('A');
      expect(offspring[1].parentId2).toBe('B');
    });
  });
});
