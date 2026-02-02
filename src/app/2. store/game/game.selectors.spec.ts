import { describe, it, expect } from 'vitest';
import {
  selectPhase,
  selectPigeons,
  selectPigeonsWithPhenotype,
  selectSelectedParent1,
  selectSelectedParent2,
  selectBothParentsSelected,
  selectOffspring,
  selectWinningOffspring,
  selectStepsRemaining,
  selectGoalGenotype,
  selectGoalPhenotype,
  selectCanBreed,
} from './game.selectors';
import { GameState, initialGameState } from './game.state';
import { getStartingPigeons } from '../../3. shared/genetics';

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

  describe('selectPigeons', () => {
    it('returns pigeons array', () => {
      const pigeons = getStartingPigeons();
      const state = createState({ pigeons });
      expect(selectPigeons(state)).toEqual(pigeons);
    });
  });

  describe('selectPigeonsWithPhenotype', () => {
    it('adds phenotype information to pigeons', () => {
      const pigeons = getStartingPigeons();
      const state = createState({ pigeons });
      const result = selectPigeonsWithPhenotype(state);

      expect(result).toHaveLength(4);
      expect(result[0].wingPhenotype).toBe('Large wings');
      expect(result[0].tailPhenotype).toBe('Pointed tail');
    });
  });

  describe('selectSelectedParent1', () => {
    it('returns null when no parent selected', () => {
      const state = createState({ pigeons: getStartingPigeons(), selectedParent1Id: null });
      expect(selectSelectedParent1(state)).toBeNull();
    });

    it('returns the selected pigeon with phenotype', () => {
      const state = createState({
        pigeons: getStartingPigeons(),
        selectedParent1Id: 'A',
      });
      const result = selectSelectedParent1(state);
      expect(result).not.toBeNull();
      expect(result!.id).toBe('A');
      expect(result!.wingPhenotype).toBe('Large wings');
    });
  });

  describe('selectSelectedParent2', () => {
    it('returns null when no parent selected', () => {
      const state = createState({ pigeons: getStartingPigeons(), selectedParent2Id: null });
      expect(selectSelectedParent2(state)).toBeNull();
    });

    it('returns the selected pigeon with phenotype', () => {
      const state = createState({
        pigeons: getStartingPigeons(),
        selectedParent2Id: 'B',
      });
      const result = selectSelectedParent2(state);
      expect(result).not.toBeNull();
      expect(result!.id).toBe('B');
      expect(result!.wingPhenotype).toBe('Small wings');
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
      const state = createState({});
      expect(selectOffspring(state)).toEqual([]);
    });

    it('returns offspring array with phenotypes when breeding result exists', () => {
      const state = createState({
        lastBreedingResult: {
          wingSquare: { parent1Alleles: ['W', 'w'], parent2Alleles: ['W', 'w'], grid: ['WW', 'Ww', 'Ww', 'ww'] },
          tailSquare: { parent1Alleles: ['T', 't'], parent2Alleles: ['T', 't'], grid: ['TT', 'Tt', 'Tt', 'tt'] },
          outcomes: [],
          offspring: [
            { id: 'test1', wingGenotype: 'Ww', tailGenotype: 'Tt' },
            { id: 'test2', wingGenotype: 'WW', tailGenotype: 'TT' },
          ],
        },
      });
      const result = selectOffspring(state);
      expect(result).toHaveLength(2);
      expect(result[0].wingPhenotype).toBe('Medium wings');
      expect(result[0].tailPhenotype).toBe('Standard tail');
      expect(result[1].wingPhenotype).toBe('Large wings');
      expect(result[1].tailPhenotype).toBe('Fan tail');
    });
  });

  describe('selectWinningOffspring', () => {
    it('returns null when no breeding result', () => {
      const state = createState({});
      expect(selectWinningOffspring(state)).toBeNull();
    });

    it('returns null when no offspring matches goal', () => {
      const state = createState({
        goalWingGenotype: 'WW',
        goalTailGenotype: 'TT',
        lastBreedingResult: {
          wingSquare: { parent1Alleles: ['W', 'w'], parent2Alleles: ['W', 'w'], grid: ['WW', 'Ww', 'Ww', 'ww'] },
          tailSquare: { parent1Alleles: ['T', 't'], parent2Alleles: ['T', 't'], grid: ['TT', 'Tt', 'Tt', 'tt'] },
          outcomes: [],
          offspring: [
            { id: 'test1', wingGenotype: 'Ww', tailGenotype: 'Tt' },
            { id: 'test2', wingGenotype: 'ww', tailGenotype: 'tt' },
          ],
        },
      });
      expect(selectWinningOffspring(state)).toBeNull();
    });

    it('returns the winning offspring when one matches the goal', () => {
      const state = createState({
        goalWingGenotype: 'WW',
        goalTailGenotype: 'TT',
        lastBreedingResult: {
          wingSquare: { parent1Alleles: ['W', 'W'], parent2Alleles: ['W', 'W'], grid: ['WW', 'WW', 'WW', 'WW'] },
          tailSquare: { parent1Alleles: ['T', 'T'], parent2Alleles: ['T', 'T'], grid: ['TT', 'TT', 'TT', 'TT'] },
          outcomes: [],
          offspring: [
            { id: 'loser', wingGenotype: 'Ww', tailGenotype: 'Tt' },
            { id: 'winner', wingGenotype: 'WW', tailGenotype: 'TT' },
          ],
        },
      });
      const result = selectWinningOffspring(state);
      expect(result).not.toBeNull();
      expect(result!.id).toBe('winner');
    });

    it('uses dynamic goal from state', () => {
      const state = createState({
        goalWingGenotype: 'ww',
        goalTailGenotype: 'tt',
        lastBreedingResult: {
          wingSquare: { parent1Alleles: ['w', 'w'], parent2Alleles: ['w', 'w'], grid: ['ww', 'ww', 'ww', 'ww'] },
          tailSquare: { parent1Alleles: ['t', 't'], parent2Alleles: ['t', 't'], grid: ['tt', 'tt', 'tt', 'tt'] },
          outcomes: [],
          offspring: [
            { id: 'winner', wingGenotype: 'ww', tailGenotype: 'tt' },
          ],
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

  describe('selectGoalGenotype', () => {
    it('returns goal genotype', () => {
      const state = createState({});
      const result = selectGoalGenotype(state);
      expect(result.wingGenotype).toBe('WW');
      expect(result.tailGenotype).toBe('TT');
    });
  });

  describe('selectGoalPhenotype', () => {
    it('returns goal phenotype', () => {
      const state = createState({});
      const result = selectGoalPhenotype(state);
      expect(result.wingPhenotype).toBe('Large wings');
      expect(result.tailPhenotype).toBe('Fan tail');
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
