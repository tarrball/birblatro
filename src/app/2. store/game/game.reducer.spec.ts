import { describe, it, expect } from 'vitest';
import { gameReducer } from './game.reducer';
import { initialGameState, GameState, BreedingResult } from './game.state';
import * as GameActions from './game.actions';
import { MAX_BREEDING_STEPS, Bird } from '../../3. shared/genetics';

// Helper to create a started game state
function createStartedState(overrides: Partial<GameState> = {}): GameState {
  const birds: Bird[] = [
    { id: 'A', wingGenotype: 'WW', tailGenotype: 'tt' },
    { id: 'B', wingGenotype: 'ww', tailGenotype: 'TT' },
    { id: 'C', wingGenotype: 'Ww', tailGenotype: 'Tt' },
    { id: 'D', wingGenotype: 'Ww', tailGenotype: 'tt' },
  ];

  return gameReducer(
    initialGameState,
    GameActions.gameInitialized({
      birds,
      goalWingGenotype: 'WW',
      goalTailGenotype: 'TT',
      ...overrides,
    })
  );
}

// Helper to create a breeding result
function createBreedingResult(offspring: Bird[]): BreedingResult {
  return {
    wingSquare: {
      parent1Alleles: ['W', 'w'] as [string, string],
      parent2Alleles: ['w', 'w'] as [string, string],
      grid: ['Ww', 'Ww', 'ww', 'ww'] as [string, string, string, string],
    },
    tailSquare: {
      parent1Alleles: ['t', 't'] as [string, string],
      parent2Alleles: ['T', 'T'] as [string, string],
      grid: ['Tt', 'Tt', 'Tt', 'Tt'] as [string, string, string, string],
    },
    outcomes: [],
    offspring,
  };
}

describe('Game Reducer', () => {
  describe('initial state', () => {
    it('returns the initial state', () => {
      const action = { type: 'unknown' };
      const state = gameReducer(undefined, action);
      expect(state).toEqual(initialGameState);
    });
  });

  describe('startGame', () => {
    it('returns same state (initialization handled by effects)', () => {
      const state = gameReducer(initialGameState, GameActions.startGame());
      expect(state).toBe(initialGameState);
    });
  });

  describe('gameInitialized', () => {
    it('transitions to deck phase', () => {
      const state = createStartedState();
      expect(state.phase).toBe('deck');
    });

    it('loads provided birds', () => {
      const state = createStartedState();
      expect(state.birds).toHaveLength(4);
      expect(state.birds[0].id).toBe('A');
    });

    it('sets the goal genotypes', () => {
      const state = createStartedState();
      expect(state.goalWingGenotype).toBe('WW');
      expect(state.goalTailGenotype).toBe('TT');
    });

    it('sets steps remaining', () => {
      const state = createStartedState();
      expect(state.stepsRemaining).toBe(MAX_BREEDING_STEPS);
    });

    it('clears any previous selection', () => {
      const previousState: GameState = {
        ...initialGameState,
        selectedParent1Id: 'A',
        selectedParent2Id: 'B',
      };
      const state = gameReducer(
        previousState,
        GameActions.gameInitialized({
          birds: [],
          goalWingGenotype: 'WW',
          goalTailGenotype: 'TT',
        })
      );
      expect(state.selectedParent1Id).toBeNull();
      expect(state.selectedParent2Id).toBeNull();
    });
  });

  describe('selectParent1', () => {
    it('selects a bird as parent 1', () => {
      const startedState = createStartedState();
      const state = gameReducer(startedState, GameActions.selectParent1({ birdId: 'A' }));
      expect(state.selectedParent1Id).toBe('A');
    });

    it('does not allow selecting the same bird as parent 2', () => {
      let state = createStartedState();
      state = gameReducer(state, GameActions.selectParent2({ birdId: 'B' }));
      state = gameReducer(state, GameActions.selectParent1({ birdId: 'B' }));
      expect(state.selectedParent1Id).toBeNull();
    });
  });

  describe('selectParent2', () => {
    it('selects a bird as parent 2', () => {
      const startedState = createStartedState();
      const state = gameReducer(startedState, GameActions.selectParent2({ birdId: 'B' }));
      expect(state.selectedParent2Id).toBe('B');
    });

    it('does not allow selecting the same bird as parent 1', () => {
      let state = createStartedState();
      state = gameReducer(state, GameActions.selectParent1({ birdId: 'A' }));
      state = gameReducer(state, GameActions.selectParent2({ birdId: 'A' }));
      expect(state.selectedParent2Id).toBeNull();
    });
  });

  describe('clearParentSelection', () => {
    it('clears both parent selections', () => {
      let state = createStartedState();
      state = gameReducer(state, GameActions.selectParent1({ birdId: 'A' }));
      state = gameReducer(state, GameActions.selectParent2({ birdId: 'B' }));
      state = gameReducer(state, GameActions.clearParentSelection());
      expect(state.selectedParent1Id).toBeNull();
      expect(state.selectedParent2Id).toBeNull();
    });
  });

  describe('confirmBreeding', () => {
    it('returns same state (breeding handled by effects)', () => {
      let state = createStartedState();
      state = gameReducer(state, GameActions.selectParent1({ birdId: 'A' }));
      state = gameReducer(state, GameActions.selectParent2({ birdId: 'B' }));
      const stateBeforeBreeding = state;
      state = gameReducer(state, GameActions.confirmBreeding());
      expect(state).toBe(stateBeforeBreeding);
    });
  });

  describe('breedingComplete', () => {
    it('transitions to result phase', () => {
      let state = createStartedState();
      const result = createBreedingResult([
        { id: 'offspring-1', wingGenotype: 'Ww', tailGenotype: 'Tt' },
        { id: 'offspring-2', wingGenotype: 'Ww', tailGenotype: 'Tt' },
      ]);
      state = gameReducer(state, GameActions.breedingComplete({ result }));
      expect(state.phase).toBe('result');
    });

    it('stores the breeding result', () => {
      let state = createStartedState();
      const result = createBreedingResult([
        { id: 'offspring-1', wingGenotype: 'Ww', tailGenotype: 'Tt', parentId1: 'A', parentId2: 'B' },
        { id: 'offspring-2', wingGenotype: 'Ww', tailGenotype: 'Tt', parentId1: 'A', parentId2: 'B' },
      ]);
      state = gameReducer(state, GameActions.breedingComplete({ result }));
      expect(state.lastBreedingResult).toEqual(result);
      expect(state.lastBreedingResult!.offspring).toHaveLength(2);
      expect(state.lastBreedingResult!.offspring[0].parentId1).toBe('A');
      expect(state.lastBreedingResult!.offspring[0].parentId2).toBe('B');
    });
  });

  describe('continueFromResult', () => {
    it('adds all offspring to birds', () => {
      let state = createStartedState();
      const result = createBreedingResult([
        { id: 'offspring-1', wingGenotype: 'Ww', tailGenotype: 'Tt', parentId1: 'A', parentId2: 'B' },
        { id: 'offspring-2', wingGenotype: 'Ww', tailGenotype: 'Tt', parentId1: 'A', parentId2: 'B' },
      ]);
      state = gameReducer(state, GameActions.breedingComplete({ result }));

      state = gameReducer(state, GameActions.continueFromResult());
      // 4 starting birds + 2 offspring = 6
      expect(state.birds).toHaveLength(6);
      expect(state.birds.find((p) => p.id === 'offspring-1')).toBeDefined();
      expect(state.birds.find((p) => p.id === 'offspring-2')).toBeDefined();
    });

    it('decrements steps remaining', () => {
      let state = createStartedState();
      const initialSteps = state.stepsRemaining;

      const result = createBreedingResult([
        { id: 'offspring-1', wingGenotype: 'Ww', tailGenotype: 'Tt' },
      ]);
      state = gameReducer(state, GameActions.breedingComplete({ result }));
      state = gameReducer(state, GameActions.continueFromResult());

      expect(state.stepsRemaining).toBe(initialSteps - 1);
    });

    it('transitions to lose phase when steps exhausted without winning', () => {
      const birds: Bird[] = [
        { id: 'A', wingGenotype: 'WW', tailGenotype: 'tt' },
        { id: 'B', wingGenotype: 'ww', tailGenotype: 'TT' },
      ];
      let state: GameState = {
        ...initialGameState,
        phase: 'result',
        birds,
        stepsRemaining: 1,
        goalWingGenotype: 'WW',
        goalTailGenotype: 'TT',
        lastBreedingResult: createBreedingResult([
          { id: 'test1', wingGenotype: 'Ww', tailGenotype: 'Tt' },
          { id: 'test2', wingGenotype: 'Ww', tailGenotype: 'Tt' }, // Not winners
        ]),
      };

      state = gameReducer(state, GameActions.continueFromResult());
      expect(state.phase).toBe('lose');
      expect(state.stepsRemaining).toBe(0);
    });

    it('transitions to win phase when any offspring matches the goal', () => {
      const birds: Bird[] = [
        { id: 'A', wingGenotype: 'WW', tailGenotype: 'tt' },
        { id: 'B', wingGenotype: 'ww', tailGenotype: 'TT' },
      ];
      let state: GameState = {
        ...initialGameState,
        phase: 'result',
        birds,
        stepsRemaining: 2,
        goalWingGenotype: 'WW',
        goalTailGenotype: 'TT',
        lastBreedingResult: createBreedingResult([
          { id: 'loser', wingGenotype: 'Ww', tailGenotype: 'Tt' },
          { id: 'winner', wingGenotype: 'WW', tailGenotype: 'TT' }, // Winner!
        ]),
      };

      state = gameReducer(state, GameActions.continueFromResult());
      expect(state.phase).toBe('win');
    });

    it('uses dynamic goal from state for win condition', () => {
      const birds: Bird[] = [
        { id: 'A', wingGenotype: 'Ww', tailGenotype: 'Tt' },
      ];
      // Goal is ww tt (different from default)
      let state: GameState = {
        ...initialGameState,
        phase: 'result',
        birds,
        stepsRemaining: 2,
        goalWingGenotype: 'ww',
        goalTailGenotype: 'tt',
        lastBreedingResult: createBreedingResult([
          { id: 'winner', wingGenotype: 'ww', tailGenotype: 'tt' }, // Matches custom goal
        ]),
      };

      state = gameReducer(state, GameActions.continueFromResult());
      expect(state.phase).toBe('win');
    });

    it('clears parent selection after continuing', () => {
      let state = createStartedState();
      state = gameReducer(state, GameActions.selectParent1({ birdId: 'A' }));
      state = gameReducer(state, GameActions.selectParent2({ birdId: 'B' }));
      const result = createBreedingResult([
        { id: 'offspring-1', wingGenotype: 'Ww', tailGenotype: 'Tt' },
      ]);
      state = gameReducer(state, GameActions.breedingComplete({ result }));
      state = gameReducer(state, GameActions.continueFromResult());

      expect(state.selectedParent1Id).toBeNull();
      expect(state.selectedParent2Id).toBeNull();
    });

    it('returns same state when no breeding result exists', () => {
      const state = createStartedState();
      const newState = gameReducer(state, GameActions.continueFromResult());
      expect(newState).toBe(state);
    });
  });

  describe('resetGame', () => {
    it('returns to initial state', () => {
      let state = createStartedState();
      state = gameReducer(state, GameActions.selectParent1({ birdId: 'A' }));
      state = gameReducer(state, GameActions.selectParent2({ birdId: 'B' }));
      const result = createBreedingResult([
        { id: 'offspring-1', wingGenotype: 'Ww', tailGenotype: 'Tt' },
      ]);
      state = gameReducer(state, GameActions.breedingComplete({ result }));

      state = gameReducer(state, GameActions.resetGame());
      expect(state).toEqual(initialGameState);
    });
  });
});
