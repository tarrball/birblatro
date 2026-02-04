import { describe, it, expect } from 'vitest';
import {
  selectPhase,
  selectBirds,
  selectBirdsWithPhenotype,
  selectSelectedParent1,
  selectSelectedParent2,
  selectBothParentsSelected,
  selectOffspring,
  selectWinningOffspring,
  selectStepsRemaining,
  selectGoalGenotypes,
  selectGoalPhenotypes,
  selectCanBreed,
} from './game.selectors';
import { GameState, initialGameState } from './game.state';
import { getStartingBirds, createBird, DEFAULT_TRAIT_SET_ID } from '../../3. shared/genetics';

describe('Game Selectors', () => {
  const createState = (gameState: Partial<GameState>): { game: GameState } => ({
    game: { ...initialGameState, ...gameState },
  });

  describe('selectPhase', () => {
    it('returns the current phase', () => {
      const state = createState({ phase: 'deck' });
      expect(selectPhase(state)).toBe('deck');
    });
  });

  describe('selectBirds', () => {
    it('returns birds array', () => {
      const birds = getStartingBirds();
      const state = createState({ birds });
      expect(selectBirds(state)).toEqual(birds);
    });
  });

  describe('selectBirdsWithPhenotype', () => {
    it('adds phenotype information to birds', () => {
      const birds = getStartingBirds();
      const state = createState({ birds, activeTraitSetId: DEFAULT_TRAIT_SET_ID });
      const result = selectBirdsWithPhenotype(state);

      expect(result).toHaveLength(4);
      expect(result[0].phenotypes['wing']).toBe('Large wings');
      expect(result[0].phenotypes['tail']).toBe('Pointed tail');
    });
  });

  describe('selectSelectedParent1', () => {
    it('returns null when no parent selected', () => {
      const state = createState({
        birds: getStartingBirds(),
        selectedParent1Id: null,
        activeTraitSetId: DEFAULT_TRAIT_SET_ID,
      });
      expect(selectSelectedParent1(state)).toBeNull();
    });

    it('returns the selected bird with phenotype', () => {
      const state = createState({
        birds: getStartingBirds(),
        selectedParent1Id: 'A',
        activeTraitSetId: DEFAULT_TRAIT_SET_ID,
      });
      const result = selectSelectedParent1(state);
      expect(result).not.toBeNull();
      expect(result!.id).toBe('A');
      expect(result!.phenotypes['wing']).toBe('Large wings');
    });
  });

  describe('selectSelectedParent2', () => {
    it('returns null when no parent selected', () => {
      const state = createState({
        birds: getStartingBirds(),
        selectedParent2Id: null,
        activeTraitSetId: DEFAULT_TRAIT_SET_ID,
      });
      expect(selectSelectedParent2(state)).toBeNull();
    });

    it('returns the selected bird with phenotype', () => {
      const state = createState({
        birds: getStartingBirds(),
        selectedParent2Id: 'B',
        activeTraitSetId: DEFAULT_TRAIT_SET_ID,
      });
      const result = selectSelectedParent2(state);
      expect(result).not.toBeNull();
      expect(result!.id).toBe('B');
      expect(result!.phenotypes['wing']).toBe('Small wings');
    });
  });

  describe('selectBothParentsSelected', () => {
    it('returns false when neither parent selected', () => {
      const state = createState({});
      expect(selectBothParentsSelected(state)).toBe(false);
    });

    it('returns false when only one parent selected', () => {
      const state = createState({ selectedParent1Id: 'A' });
      expect(selectBothParentsSelected(state)).toBe(false);
    });

    it('returns true when both parents selected', () => {
      const state = createState({ selectedParent1Id: 'A', selectedParent2Id: 'B' });
      expect(selectBothParentsSelected(state)).toBe(true);
    });
  });

  describe('selectOffspring', () => {
    it('returns empty array when no breeding result', () => {
      const state = createState({ activeTraitSetId: DEFAULT_TRAIT_SET_ID });
      expect(selectOffspring(state)).toEqual([]);
    });

    it('returns offspring array with phenotypes when breeding result exists', () => {
      const state = createState({
        activeTraitSetId: DEFAULT_TRAIT_SET_ID,
        lastBreedingResult: {
          squares: [
            {
              traitId: 'wing',
              parent1Alleles: ['W', 'w'],
              parent2Alleles: ['W', 'w'],
              grid: ['WW', 'Ww', 'Ww', 'ww'],
            },
            {
              traitId: 'tail',
              parent1Alleles: ['T', 't'],
              parent2Alleles: ['T', 't'],
              grid: ['TT', 'Tt', 'Tt', 'tt'],
            },
          ],
          outcomes: [],
          offspring: [
            createBird('test1', { wing: 'Ww', tail: 'Tt' }),
            createBird('test2', { wing: 'WW', tail: 'TT' }),
          ],
        },
      });
      const result = selectOffspring(state);
      expect(result).toHaveLength(2);
      expect(result[0].phenotypes['wing']).toBe('Medium wings');
      expect(result[0].phenotypes['tail']).toBe('Standard tail');
      expect(result[1].phenotypes['wing']).toBe('Large wings');
      expect(result[1].phenotypes['tail']).toBe('Fan tail');
    });
  });

  describe('selectWinningOffspring', () => {
    it('returns null when no breeding result', () => {
      const state = createState({ activeTraitSetId: DEFAULT_TRAIT_SET_ID });
      expect(selectWinningOffspring(state)).toBeNull();
    });

    it('returns null when no offspring matches goal', () => {
      const state = createState({
        goalGenotypes: { wing: 'WW', tail: 'TT' },
        activeTraitSetId: DEFAULT_TRAIT_SET_ID,
        lastBreedingResult: {
          squares: [
            {
              traitId: 'wing',
              parent1Alleles: ['W', 'w'],
              parent2Alleles: ['W', 'w'],
              grid: ['WW', 'Ww', 'Ww', 'ww'],
            },
            {
              traitId: 'tail',
              parent1Alleles: ['T', 't'],
              parent2Alleles: ['T', 't'],
              grid: ['TT', 'Tt', 'Tt', 'tt'],
            },
          ],
          outcomes: [],
          offspring: [
            createBird('test1', { wing: 'Ww', tail: 'Tt' }),
            createBird('test2', { wing: 'ww', tail: 'tt' }),
          ],
        },
      });
      expect(selectWinningOffspring(state)).toBeNull();
    });

    it('returns the winning offspring when one matches the goal', () => {
      const state = createState({
        goalGenotypes: { wing: 'WW', tail: 'TT' },
        activeTraitSetId: DEFAULT_TRAIT_SET_ID,
        lastBreedingResult: {
          squares: [
            {
              traitId: 'wing',
              parent1Alleles: ['W', 'W'],
              parent2Alleles: ['W', 'W'],
              grid: ['WW', 'WW', 'WW', 'WW'],
            },
            {
              traitId: 'tail',
              parent1Alleles: ['T', 'T'],
              parent2Alleles: ['T', 'T'],
              grid: ['TT', 'TT', 'TT', 'TT'],
            },
          ],
          outcomes: [],
          offspring: [
            createBird('loser', { wing: 'Ww', tail: 'Tt' }),
            createBird('winner', { wing: 'WW', tail: 'TT' }),
          ],
        },
      });
      const result = selectWinningOffspring(state);
      expect(result).not.toBeNull();
      expect(result!.id).toBe('winner');
    });

    it('uses dynamic goal from state', () => {
      const state = createState({
        goalGenotypes: { wing: 'ww', tail: 'tt' },
        activeTraitSetId: DEFAULT_TRAIT_SET_ID,
        lastBreedingResult: {
          squares: [
            {
              traitId: 'wing',
              parent1Alleles: ['w', 'w'],
              parent2Alleles: ['w', 'w'],
              grid: ['ww', 'ww', 'ww', 'ww'],
            },
            {
              traitId: 'tail',
              parent1Alleles: ['t', 't'],
              parent2Alleles: ['t', 't'],
              grid: ['tt', 'tt', 'tt', 'tt'],
            },
          ],
          outcomes: [],
          offspring: [createBird('winner', { wing: 'ww', tail: 'tt' })],
        },
      });
      const result = selectWinningOffspring(state);
      expect(result).not.toBeNull();
      expect(result!.id).toBe('winner');
    });
  });

  describe('selectStepsRemaining', () => {
    it('returns steps remaining', () => {
      const state = createState({ stepsRemaining: 2 });
      expect(selectStepsRemaining(state)).toBe(2);
    });
  });

  describe('selectGoalGenotypes', () => {
    it('returns goal genotypes', () => {
      const state = createState({ goalGenotypes: { wing: 'WW', tail: 'TT' } });
      const result = selectGoalGenotypes(state);
      expect(result['wing']).toBe('WW');
      expect(result['tail']).toBe('TT');
    });
  });

  describe('selectGoalPhenotypes', () => {
    it('returns goal phenotypes', () => {
      const state = createState({
        goalGenotypes: { wing: 'WW', tail: 'TT' },
        activeTraitSetId: DEFAULT_TRAIT_SET_ID,
      });
      const result = selectGoalPhenotypes(state);
      expect(result['wing']).toBe('Large wings');
      expect(result['tail']).toBe('Fan tail');
    });
  });

  describe('selectCanBreed', () => {
    it('returns false when not in deck phase', () => {
      const state = createState({
        phase: 'result',
        selectedParent1Id: 'A',
        selectedParent2Id: 'B',
        stepsRemaining: 3,
      });
      expect(selectCanBreed(state)).toBe(false);
    });

    it('returns false when parents not selected', () => {
      const state = createState({
        phase: 'deck',
        stepsRemaining: 3,
      });
      expect(selectCanBreed(state)).toBe(false);
    });

    it('returns false when no steps remaining', () => {
      const state = createState({
        phase: 'deck',
        selectedParent1Id: 'A',
        selectedParent2Id: 'B',
        stepsRemaining: 0,
      });
      expect(selectCanBreed(state)).toBe(false);
    });

    it('returns true when all conditions met', () => {
      const state = createState({
        phase: 'deck',
        selectedParent1Id: 'A',
        selectedParent2Id: 'B',
        stepsRemaining: 3,
      });
      expect(selectCanBreed(state)).toBe(true);
    });
  });
});
