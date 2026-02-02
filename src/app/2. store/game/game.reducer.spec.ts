import { describe, it, expect } from 'vitest';
import { gameReducer } from './game.reducer';
import { initialGameState, GameState } from './game.state';
import * as GameActions from './game.actions';
import { getStartingPigeons, MAX_BREEDING_STEPS } from '../../3. shared/genetics';

describe('Game Reducer', () => {
  describe('initial state', () => {
    it('returns the initial state', () => {
      const action = { type: 'unknown' };
      const state = gameReducer(undefined, action);
      expect(state).toEqual(initialGameState);
    });
  });

  describe('startGame', () => {
    it('transitions to deck phase', () => {
      const state = gameReducer(initialGameState, GameActions.startGame());
      expect(state.phase).toBe('deck');
    });

    it('loads starting pigeons', () => {
      const state = gameReducer(initialGameState, GameActions.startGame());
      expect(state.pigeons).toEqual(getStartingPigeons());
      expect(state.pigeons).toHaveLength(4);
    });

    it('sets steps remaining', () => {
      const state = gameReducer(initialGameState, GameActions.startGame());
      expect(state.stepsRemaining).toBe(MAX_BREEDING_STEPS);
    });

    it('clears any previous selection', () => {
      const previousState: GameState = {
        ...initialGameState,
        selectedParent1Id: 'A',
        selectedParent2Id: 'B',
      };
      const state = gameReducer(previousState, GameActions.startGame());
      expect(state.selectedParent1Id).toBeNull();
      expect(state.selectedParent2Id).toBeNull();
    });
  });

  describe('selectParent1', () => {
    it('selects a pigeon as parent 1', () => {
      const startedState = gameReducer(initialGameState, GameActions.startGame());
      const state = gameReducer(startedState, GameActions.selectParent1({ pigeonId: 'A' }));
      expect(state.selectedParent1Id).toBe('A');
    });

    it('does not allow selecting the same pigeon as parent 2', () => {
      let state = gameReducer(initialGameState, GameActions.startGame());
      state = gameReducer(state, GameActions.selectParent2({ pigeonId: 'B' }));
      state = gameReducer(state, GameActions.selectParent1({ pigeonId: 'B' }));
      expect(state.selectedParent1Id).toBeNull();
    });
  });

  describe('selectParent2', () => {
    it('selects a pigeon as parent 2', () => {
      const startedState = gameReducer(initialGameState, GameActions.startGame());
      const state = gameReducer(startedState, GameActions.selectParent2({ pigeonId: 'B' }));
      expect(state.selectedParent2Id).toBe('B');
    });

    it('does not allow selecting the same pigeon as parent 1', () => {
      let state = gameReducer(initialGameState, GameActions.startGame());
      state = gameReducer(state, GameActions.selectParent1({ pigeonId: 'A' }));
      state = gameReducer(state, GameActions.selectParent2({ pigeonId: 'A' }));
      expect(state.selectedParent2Id).toBeNull();
    });
  });

  describe('clearParentSelection', () => {
    it('clears both parent selections', () => {
      let state = gameReducer(initialGameState, GameActions.startGame());
      state = gameReducer(state, GameActions.selectParent1({ pigeonId: 'A' }));
      state = gameReducer(state, GameActions.selectParent2({ pigeonId: 'B' }));
      state = gameReducer(state, GameActions.clearParentSelection());
      expect(state.selectedParent1Id).toBeNull();
      expect(state.selectedParent2Id).toBeNull();
    });
  });

  describe('confirmBreeding', () => {
    it('returns same state (breeding handled by effects)', () => {
      let state = gameReducer(initialGameState, GameActions.startGame());
      state = gameReducer(state, GameActions.selectParent1({ pigeonId: 'A' }));
      state = gameReducer(state, GameActions.selectParent2({ pigeonId: 'B' }));
      const stateBeforeBreeding = state;
      state = gameReducer(state, GameActions.confirmBreeding());
      expect(state).toBe(stateBeforeBreeding);
    });
  });

  describe('breedingComplete', () => {
    it('transitions to result phase', () => {
      let state = gameReducer(initialGameState, GameActions.startGame());
      const result = {
        wingSquare: { parent1Alleles: ['W', 'w'], parent2Alleles: ['w', 'w'], grid: ['Ww', 'Ww', 'ww', 'ww'] as [string, string, string, string] },
        tailSquare: { parent1Alleles: ['t', 't'], parent2Alleles: ['T', 'T'], grid: ['Tt', 'Tt', 'Tt', 'Tt'] as [string, string, string, string] },
        outcomes: [],
        offspring: [
          { id: 'offspring-1', wingGenotype: 'Ww' as const, tailGenotype: 'Tt' as const },
          { id: 'offspring-2', wingGenotype: 'Ww' as const, tailGenotype: 'Tt' as const },
        ],
      };
      state = gameReducer(state, GameActions.breedingComplete({ result }));
      expect(state.phase).toBe('result');
    });

    it('stores the breeding result', () => {
      let state = gameReducer(initialGameState, GameActions.startGame());
      const result = {
        wingSquare: { parent1Alleles: ['W', 'w'], parent2Alleles: ['w', 'w'], grid: ['Ww', 'Ww', 'ww', 'ww'] as [string, string, string, string] },
        tailSquare: { parent1Alleles: ['t', 't'], parent2Alleles: ['T', 'T'], grid: ['Tt', 'Tt', 'Tt', 'Tt'] as [string, string, string, string] },
        outcomes: [],
        offspring: [
          { id: 'offspring-1', wingGenotype: 'Ww' as const, tailGenotype: 'Tt' as const, parentId1: 'A', parentId2: 'B' },
          { id: 'offspring-2', wingGenotype: 'Ww' as const, tailGenotype: 'Tt' as const, parentId1: 'A', parentId2: 'B' },
        ],
      };
      state = gameReducer(state, GameActions.breedingComplete({ result }));
      expect(state.lastBreedingResult).toEqual(result);
      expect(state.lastBreedingResult!.offspring).toHaveLength(2);
      expect(state.lastBreedingResult!.offspring[0].parentId1).toBe('A');
      expect(state.lastBreedingResult!.offspring[0].parentId2).toBe('B');
    });
  });

  describe('continueFromResult', () => {
    it('adds all offspring to pigeons', () => {
      let state = gameReducer(initialGameState, GameActions.startGame());
      const result = {
        wingSquare: { parent1Alleles: ['W', 'W'], parent2Alleles: ['w', 'w'], grid: ['Ww', 'Ww', 'Ww', 'Ww'] as [string, string, string, string] },
        tailSquare: { parent1Alleles: ['t', 't'], parent2Alleles: ['T', 'T'], grid: ['Tt', 'Tt', 'Tt', 'Tt'] as [string, string, string, string] },
        outcomes: [],
        offspring: [
          { id: 'offspring-1', wingGenotype: 'Ww' as const, tailGenotype: 'Tt' as const, parentId1: 'A', parentId2: 'B' },
          { id: 'offspring-2', wingGenotype: 'Ww' as const, tailGenotype: 'Tt' as const, parentId1: 'A', parentId2: 'B' },
        ],
      };
      state = gameReducer(state, GameActions.breedingComplete({ result }));

      state = gameReducer(state, GameActions.continueFromResult());
      // 4 starting pigeons + 2 offspring = 6
      expect(state.pigeons).toHaveLength(6);
      expect(state.pigeons.find((p) => p.id === 'offspring-1')).toBeDefined();
      expect(state.pigeons.find((p) => p.id === 'offspring-2')).toBeDefined();
    });

    it('decrements steps remaining', () => {
      let state = gameReducer(initialGameState, GameActions.startGame());
      const initialSteps = state.stepsRemaining;

      const result = {
        wingSquare: { parent1Alleles: ['W', 'W'], parent2Alleles: ['w', 'w'], grid: ['Ww', 'Ww', 'Ww', 'Ww'] as [string, string, string, string] },
        tailSquare: { parent1Alleles: ['t', 't'], parent2Alleles: ['T', 'T'], grid: ['Tt', 'Tt', 'Tt', 'Tt'] as [string, string, string, string] },
        outcomes: [],
        offspring: [
          { id: 'offspring-1', wingGenotype: 'Ww' as const, tailGenotype: 'Tt' as const },
        ],
      };
      state = gameReducer(state, GameActions.breedingComplete({ result }));
      state = gameReducer(state, GameActions.continueFromResult());

      expect(state.stepsRemaining).toBe(initialSteps - 1);
    });

    it('transitions to lose phase when steps exhausted without winning', () => {
      let state: GameState = {
        ...initialGameState,
        phase: 'result',
        pigeons: getStartingPigeons(),
        stepsRemaining: 1,
        lastBreedingResult: {
          wingSquare: { parent1Alleles: ['W', 'w'], parent2Alleles: ['W', 'w'], grid: ['WW', 'Ww', 'Ww', 'ww'] },
          tailSquare: { parent1Alleles: ['T', 't'], parent2Alleles: ['T', 't'], grid: ['TT', 'Tt', 'Tt', 'tt'] },
          outcomes: [],
          offspring: [
            { id: 'test1', wingGenotype: 'Ww', tailGenotype: 'Tt' },
            { id: 'test2', wingGenotype: 'Ww', tailGenotype: 'Tt' },
          ], // Not winners
        },
      };

      state = gameReducer(state, GameActions.continueFromResult());
      expect(state.phase).toBe('lose');
      expect(state.stepsRemaining).toBe(0);
    });

    it('transitions to win phase when any offspring is the goal pigeon', () => {
      let state: GameState = {
        ...initialGameState,
        phase: 'result',
        pigeons: getStartingPigeons(),
        stepsRemaining: 2,
        lastBreedingResult: {
          wingSquare: { parent1Alleles: ['W', 'W'], parent2Alleles: ['W', 'W'], grid: ['WW', 'WW', 'WW', 'WW'] },
          tailSquare: { parent1Alleles: ['T', 'T'], parent2Alleles: ['T', 'T'], grid: ['TT', 'TT', 'TT', 'TT'] },
          outcomes: [],
          offspring: [
            { id: 'loser', wingGenotype: 'Ww', tailGenotype: 'Tt' },
            { id: 'winner', wingGenotype: 'WW', tailGenotype: 'TT' }, // Winner!
          ],
        },
      };

      state = gameReducer(state, GameActions.continueFromResult());
      expect(state.phase).toBe('win');
    });

    it('clears parent selection after continuing', () => {
      let state = gameReducer(initialGameState, GameActions.startGame());
      state = gameReducer(state, GameActions.selectParent1({ pigeonId: 'A' }));
      state = gameReducer(state, GameActions.selectParent2({ pigeonId: 'B' }));
      const result = {
        wingSquare: { parent1Alleles: ['W', 'W'], parent2Alleles: ['w', 'w'], grid: ['Ww', 'Ww', 'Ww', 'Ww'] as [string, string, string, string] },
        tailSquare: { parent1Alleles: ['t', 't'], parent2Alleles: ['T', 'T'], grid: ['Tt', 'Tt', 'Tt', 'Tt'] as [string, string, string, string] },
        outcomes: [],
        offspring: [
          { id: 'offspring-1', wingGenotype: 'Ww' as const, tailGenotype: 'Tt' as const },
        ],
      };
      state = gameReducer(state, GameActions.breedingComplete({ result }));
      state = gameReducer(state, GameActions.continueFromResult());

      expect(state.selectedParent1Id).toBeNull();
      expect(state.selectedParent2Id).toBeNull();
    });
  });

  describe('resetGame', () => {
    it('returns to initial state', () => {
      let state = gameReducer(initialGameState, GameActions.startGame());
      state = gameReducer(state, GameActions.selectParent1({ pigeonId: 'A' }));
      state = gameReducer(state, GameActions.selectParent2({ pigeonId: 'B' }));
      const result = {
        wingSquare: { parent1Alleles: ['W', 'W'], parent2Alleles: ['w', 'w'], grid: ['Ww', 'Ww', 'Ww', 'Ww'] as [string, string, string, string] },
        tailSquare: { parent1Alleles: ['t', 't'], parent2Alleles: ['T', 'T'], grid: ['Tt', 'Tt', 'Tt', 'Tt'] as [string, string, string, string] },
        outcomes: [],
        offspring: [
          { id: 'offspring-1', wingGenotype: 'Ww' as const, tailGenotype: 'Tt' as const },
        ],
      };
      state = gameReducer(state, GameActions.breedingComplete({ result }));

      state = gameReducer(state, GameActions.resetGame());
      expect(state).toEqual(initialGameState);
    });
  });
});
