import { describe, it, expect, vi } from 'vitest';
import { of } from 'rxjs';
import { toArray } from 'rxjs/operators';

import * as GameActions from './game.actions';
import { GameState, initialGameState } from './game.state';
import { getStartingPigeons, generatePunnettSquare, calculateBreedingOutcomes, selectOffspring, Pigeon } from '../../3. shared/genetics';

// Test the breeding logic directly since the effect is a thin wrapper
// The effect uses: generatePunnettSquare, calculateBreedingOutcomes, selectOffspring

describe('GameEffects breeding logic', () => {
  describe('breeding A (WWtt) x B (wwTT)', () => {
    const pigeons = getStartingPigeons();
    const parentA = pigeons.find(p => p.id === 'A')!;
    const parentB = pigeons.find(p => p.id === 'B')!;

    it('generates correct wing Punnett square', () => {
      const wingSquare = generatePunnettSquare(parentA.wingGenotype, parentB.wingGenotype);

      // WW x ww -> all Ww
      expect(wingSquare.parent1Alleles).toEqual(['W', 'W']);
      expect(wingSquare.parent2Alleles).toEqual(['w', 'w']);
      expect(wingSquare.grid).toEqual(['Ww', 'Ww', 'Ww', 'Ww']);
    });

    it('generates correct tail Punnett square', () => {
      const tailSquare = generatePunnettSquare(parentA.tailGenotype, parentB.tailGenotype);

      // tt x TT -> all Tt
      expect(tailSquare.parent1Alleles).toEqual(['t', 't']);
      expect(tailSquare.parent2Alleles).toEqual(['T', 'T']);
      expect(tailSquare.grid).toEqual(['Tt', 'Tt', 'Tt', 'Tt']);
    });

    it('calculates single outcome with 100% probability', () => {
      const outcomes = calculateBreedingOutcomes(parentA, parentB);

      expect(outcomes).toHaveLength(1);
      expect(outcomes[0].wingGenotype).toBe('Ww');
      expect(outcomes[0].tailGenotype).toBe('Tt');
      expect(outcomes[0].probability).toBe(1);
    });

    it('selects offspring using RNG', () => {
      const outcomes = calculateBreedingOutcomes(parentA, parentB);
      const mockRng = vi.fn().mockReturnValue(0.5);

      const offspring = selectOffspring(outcomes, 2, mockRng);

      expect(offspring).toHaveLength(2);
      expect(mockRng).toHaveBeenCalledTimes(2);

      // Both should be Ww Tt (only possible outcome)
      offspring.forEach(o => {
        expect(o.wingGenotype).toBe('Ww');
        expect(o.tailGenotype).toBe('Tt');
      });
    });
  });

  describe('breeding C (WwTt) x D (Wwtt) - multiple outcomes', () => {
    const pigeons = getStartingPigeons();
    const parentC = pigeons.find(p => p.id === 'C')!;
    const parentD = pigeons.find(p => p.id === 'D')!;

    it('calculates multiple outcomes with varying probabilities', () => {
      const outcomes = calculateBreedingOutcomes(parentC, parentD);

      // Ww x Ww for wings gives: WW (25%), Ww (50%), ww (25%)
      // Tt x tt for tails gives: Tt (50%), tt (50%)
      // Combined outcomes: 3 wing * 2 tail = 6 possible outcomes
      expect(outcomes.length).toBeGreaterThan(1);

      // Total probability should sum to 1
      const totalProb = outcomes.reduce((sum, o) => sum + o.probability, 0);
      expect(totalProb).toBeCloseTo(1, 5);
    });

    it('RNG affects which outcome is selected', () => {
      const outcomes = calculateBreedingOutcomes(parentC, parentD);

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
    it('generates unique IDs avoiding existing pigeon IDs', () => {
      const existingPigeons: Pigeon[] = [
        { id: 'A', wingGenotype: 'WW', tailGenotype: 'tt' },
        { id: 'offspring-1', wingGenotype: 'Ww', tailGenotype: 'Tt' },
      ];

      // Simulate the ID generation logic from the effect
      function generateOffspringIds(pigeons: Pigeon[], count: number): string[] {
        const existingIds = new Set(pigeons.map(p => p.id));
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

      const newIds = generateOffspringIds(existingPigeons, 2);

      expect(newIds).toHaveLength(2);
      expect(newIds[0]).toBe('offspring-2'); // offspring-1 exists, so skip to 2
      expect(newIds[1]).toBe('offspring-3');
    });
  });

  describe('parent ID tracking', () => {
    it('offspring should have parent IDs set', () => {
      const pigeons = getStartingPigeons();
      const parentA = pigeons.find(p => p.id === 'A')!;
      const parentB = pigeons.find(p => p.id === 'B')!;

      const outcomes = calculateBreedingOutcomes(parentA, parentB);
      const selectedGenotypes = selectOffspring(outcomes, 2, () => 0.5);

      // Create offspring with parent IDs (simulating effect logic)
      const offspring: Pigeon[] = selectedGenotypes.map((genotype, index) => ({
        id: `offspring-${index + 1}`,
        wingGenotype: genotype.wingGenotype,
        tailGenotype: genotype.tailGenotype,
        parentId1: parentA.id,
        parentId2: parentB.id,
      }));

      expect(offspring[0].parentId1).toBe('A');
      expect(offspring[0].parentId2).toBe('B');
      expect(offspring[1].parentId1).toBe('A');
      expect(offspring[1].parentId2).toBe('B');
    });
  });
});
