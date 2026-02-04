import { describe, it, expect } from 'vitest';
import { gameReducer } from './game.reducer';
import { initialGameState, GameState, BreedingResult } from './game.state';
import * as GameActions from './game.actions';
import { MAX_BREEDING_STEPS, Bird, createBird, DEFAULT_TRAIT_SET_ID } from '../../3. shared/genetics';

// Helper to create a started game state
function createStartedState(overrides: Partial<GameState> = {}): GameState {
  const birds: Bird[] = [
    createBird('A', { wing: 'WW', tail: 'tt' }),
    createBird('B', { wing: 'ww', tail: 'TT' }),
    createBird('C', { wing: 'Ww', tail: 'Tt' }),
    createBird('D', { wing: 'Ww', tail: 'tt' }),
  ];

  return gameReducer(
    initialGameState,
    GameActions.gameInitialized({
      birds,
      goalGenotypes: { wing: 'WW', tail: 'TT' },
      activeTraitSetId: DEFAULT_TRAIT_SET_ID,
      ...overrides,
    })
  );
}

// Helper to create a breeding result
function createBreedingResult(offspring: Bird[]): BreedingResult {
  return {
    squares: [
      {
        traitId: 'wing',
        parent1Alleles: ['W', 'w'] as [string, string],
        parent2Alleles: ['w', 'w'] as [string, string],
        grid: ['Ww', 'Ww', 'ww', 'ww'] as [string, string, string, string],
      },
      {
        traitId: 'tail',
        parent1Alleles: ['t', 't'] as [string, string],
        parent2Alleles: ['T', 'T'] as [string, string],
        grid: ['Tt', 'Tt', 'Tt', 'Tt'] as [string, string, string, string],
      },
    ],
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
      expect(state.goalGenotypes['wing']).toBe('WW');
      expect(state.goalGenotypes['tail']).toBe('TT');
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
          goalGenotypes: { wing: 'WW', tail: 'TT' },
          activeTraitSetId: DEFAULT_TRAIT_SET_ID,
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
        createBird('offspring-1', { wing: 'Ww', tail: 'Tt' }),
        createBird('offspring-2', { wing: 'Ww', tail: 'Tt' }),
      ]);
      state = gameReducer(state, GameActions.breedingComplete({ result }));
      expect(state.phase).toBe('result');
    });

    it('stores the breeding result', () => {
      let state = createStartedState();
      const result = createBreedingResult([
        createBird('offspring-1', { wing: 'Ww', tail: 'Tt' }, 'A', 'B'),
        createBird('offspring-2', { wing: 'Ww', tail: 'Tt' }, 'A', 'B'),
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
        createBird('offspring-1', { wing: 'Ww', tail: 'Tt' }, 'A', 'B'),
        createBird('offspring-2', { wing: 'Ww', tail: 'Tt' }, 'A', 'B'),
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

      const result = createBreedingResult([createBird('offspring-1', { wing: 'Ww', tail: 'Tt' })]);
      state = gameReducer(state, GameActions.breedingComplete({ result }));
      state = gameReducer(state, GameActions.continueFromResult());

      expect(state.stepsRemaining).toBe(initialSteps - 1);
    });

    it('transitions to lose phase when steps exhausted without winning', () => {
      const birds: Bird[] = [
        createBird('A', { wing: 'WW', tail: 'tt' }),
        createBird('B', { wing: 'ww', tail: 'TT' }),
      ];
      let state: GameState = {
        ...initialGameState,
        phase: 'result',
        birds,
        stepsRemaining: 1,
        goalGenotypes: { wing: 'WW', tail: 'TT' },
        activeTraitSetId: DEFAULT_TRAIT_SET_ID,
        lastBreedingResult: createBreedingResult([
          createBird('test1', { wing: 'Ww', tail: 'Tt' }),
          createBird('test2', { wing: 'Ww', tail: 'Tt' }), // Not winners
        ]),
      };

      state = gameReducer(state, GameActions.continueFromResult());
      expect(state.phase).toBe('lose');
      expect(state.stepsRemaining).toBe(0);
    });

    it('transitions to win phase when any offspring matches the goal', () => {
      const birds: Bird[] = [
        createBird('A', { wing: 'WW', tail: 'tt' }),
        createBird('B', { wing: 'ww', tail: 'TT' }),
      ];
      let state: GameState = {
        ...initialGameState,
        phase: 'result',
        birds,
        stepsRemaining: 2,
        goalGenotypes: { wing: 'WW', tail: 'TT' },
        activeTraitSetId: DEFAULT_TRAIT_SET_ID,
        lastBreedingResult: createBreedingResult([
          createBird('loser', { wing: 'Ww', tail: 'Tt' }),
          createBird('winner', { wing: 'WW', tail: 'TT' }), // Winner!
        ]),
      };

      state = gameReducer(state, GameActions.continueFromResult());
      expect(state.phase).toBe('win');
    });

    it('uses dynamic goal from state for win condition', () => {
      const birds: Bird[] = [createBird('A', { wing: 'Ww', tail: 'Tt' })];
      // Goal is ww tt (different from default)
      let state: GameState = {
        ...initialGameState,
        phase: 'result',
        birds,
        stepsRemaining: 2,
        goalGenotypes: { wing: 'ww', tail: 'tt' },
        activeTraitSetId: DEFAULT_TRAIT_SET_ID,
        lastBreedingResult: createBreedingResult([
          createBird('winner', { wing: 'ww', tail: 'tt' }), // Matches custom goal
        ]),
      };

      state = gameReducer(state, GameActions.continueFromResult());
      expect(state.phase).toBe('win');
    });

    it('clears parent selection after continuing', () => {
      let state = createStartedState();
      state = gameReducer(state, GameActions.selectParent1({ birdId: 'A' }));
      state = gameReducer(state, GameActions.selectParent2({ birdId: 'B' }));
      const result = createBreedingResult([createBird('offspring-1', { wing: 'Ww', tail: 'Tt' })]);
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
      const result = createBreedingResult([createBird('offspring-1', { wing: 'Ww', tail: 'Tt' })]);
      state = gameReducer(state, GameActions.breedingComplete({ result }));

      state = gameReducer(state, GameActions.resetGame());
      expect(state).toEqual(initialGameState);
    });
  });

  describe('showTutorial', () => {
    it('transitions to tutorial phase', () => {
      const state = gameReducer(initialGameState, GameActions.showTutorial());
      expect(state.phase).toBe('tutorial');
    });
  });

  describe('backToIntro', () => {
    it('transitions to intro phase', () => {
      const state = createStartedState();
      const newState = gameReducer(state, GameActions.backToIntro());
      expect(newState.phase).toBe('intro');
    });
  });
});
