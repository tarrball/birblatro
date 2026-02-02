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
    it('does nothing if parents not selected', () => {
      const startedState = gameReducer(initialGameState, GameActions.startGame());
      const state = gameReducer(startedState, GameActions.confirmBreeding());
      expect(state.phase).toBe('deck');
      expect(state.lastBreedingResult).toBeNull();
    });

    it('transitions to result phase when both parents selected', () => {
      let state = gameReducer(initialGameState, GameActions.startGame());
      state = gameReducer(state, GameActions.selectParent1({ pigeonId: 'A' }));
      state = gameReducer(state, GameActions.selectParent2({ pigeonId: 'B' }));
      state = gameReducer(state, GameActions.confirmBreeding());
      expect(state.phase).toBe('result');
    });

    it('creates breeding result with Punnett squares', () => {
      let state = gameReducer(initialGameState, GameActions.startGame());
      state = gameReducer(state, GameActions.selectParent1({ pigeonId: 'A' }));
      state = gameReducer(state, GameActions.selectParent2({ pigeonId: 'B' }));
      state = gameReducer(state, GameActions.confirmBreeding());

      expect(state.lastBreedingResult).not.toBeNull();
      expect(state.lastBreedingResult!.wingSquare).toBeDefined();
      expect(state.lastBreedingResult!.tailSquare).toBeDefined();
      expect(state.lastBreedingResult!.outcomes).toBeDefined();
      expect(state.lastBreedingResult!.offspring).toBeDefined();
    });

    it('breeding A (WWtt) x B (wwTT) produces Ww Tt offspring', () => {
      let state = gameReducer(initialGameState, GameActions.startGame());
      state = gameReducer(state, GameActions.selectParent1({ pigeonId: 'A' }));
      state = gameReducer(state, GameActions.selectParent2({ pigeonId: 'B' }));
      state = gameReducer(state, GameActions.confirmBreeding());

      const offspring = state.lastBreedingResult!.offspring;
      expect(offspring.wingGenotype).toBe('Ww');
      expect(offspring.tailGenotype).toBe('Tt');
    });
  });

  describe('continueFromResult', () => {
    it('adds offspring to pigeons', () => {
      let state = gameReducer(initialGameState, GameActions.startGame());
      state = gameReducer(state, GameActions.selectParent1({ pigeonId: 'A' }));
      state = gameReducer(state, GameActions.selectParent2({ pigeonId: 'B' }));
      state = gameReducer(state, GameActions.confirmBreeding());
      const offspringId = state.lastBreedingResult!.offspring.id;

      state = gameReducer(state, GameActions.continueFromResult());
      expect(state.pigeons).toHaveLength(5);
      expect(state.pigeons.find((p) => p.id === offspringId)).toBeDefined();
    });

    it('decrements steps remaining', () => {
      let state = gameReducer(initialGameState, GameActions.startGame());
      const initialSteps = state.stepsRemaining;

      state = gameReducer(state, GameActions.selectParent1({ pigeonId: 'A' }));
      state = gameReducer(state, GameActions.selectParent2({ pigeonId: 'B' }));
      state = gameReducer(state, GameActions.confirmBreeding());
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
          offspring: { id: 'test', wingGenotype: 'Ww', tailGenotype: 'Tt' }, // Not a winner
        },
      };

      state = gameReducer(state, GameActions.continueFromResult());
      expect(state.phase).toBe('lose');
      expect(state.stepsRemaining).toBe(0);
    });

    it('transitions to win phase when goal pigeon is produced', () => {
      let state: GameState = {
        ...initialGameState,
        phase: 'result',
        pigeons: getStartingPigeons(),
        stepsRemaining: 2,
        lastBreedingResult: {
          wingSquare: { parent1Alleles: ['W', 'W'], parent2Alleles: ['W', 'W'], grid: ['WW', 'WW', 'WW', 'WW'] },
          tailSquare: { parent1Alleles: ['T', 'T'], parent2Alleles: ['T', 'T'], grid: ['TT', 'TT', 'TT', 'TT'] },
          outcomes: [],
          offspring: { id: 'winner', wingGenotype: 'WW', tailGenotype: 'TT' }, // Winner!
        },
      };

      state = gameReducer(state, GameActions.continueFromResult());
      expect(state.phase).toBe('win');
    });

    it('clears parent selection after continuing', () => {
      let state = gameReducer(initialGameState, GameActions.startGame());
      state = gameReducer(state, GameActions.selectParent1({ pigeonId: 'A' }));
      state = gameReducer(state, GameActions.selectParent2({ pigeonId: 'B' }));
      state = gameReducer(state, GameActions.confirmBreeding());
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
      state = gameReducer(state, GameActions.confirmBreeding());

      state = gameReducer(state, GameActions.resetGame());
      expect(state).toEqual(initialGameState);
    });
  });
});
