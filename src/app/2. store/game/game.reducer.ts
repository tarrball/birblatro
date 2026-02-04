import { createReducer, on } from '@ngrx/store';
import { produce } from 'immer';
import { GameState, initialGameState } from './game.state';
import * as GameActions from './game.actions';
import { isGoalPigeon, MAX_BREEDING_STEPS } from '../../3. shared/genetics';

export const gameReducer = createReducer(
  initialGameState,

  // startGame is handled by effects, which dispatches gameInitialized
  on(GameActions.startGame, (state) => state),

  on(GameActions.gameInitialized, (state, { pigeons, goalWingGenotype, goalTailGenotype }) =>
    produce(state, (draft) => {
      draft.phase = 'deck';
      draft.pigeons = pigeons;
      draft.selectedParent1Id = null;
      draft.selectedParent2Id = null;
      draft.lastBreedingResult = null;
      draft.stepsRemaining = MAX_BREEDING_STEPS;
      draft.goalWingGenotype = goalWingGenotype;
      draft.goalTailGenotype = goalTailGenotype;
    })
  ),

  on(GameActions.selectParent1, (state, { pigeonId }) => {
    if (pigeonId === state.selectedParent2Id) {
      return state;
    }
    return produce(state, (draft) => {
      draft.selectedParent1Id = pigeonId;
    });
  }),

  on(GameActions.selectParent2, (state, { pigeonId }) => {
    if (pigeonId === state.selectedParent1Id) {
      return state;
    }
    return produce(state, (draft) => {
      draft.selectedParent2Id = pigeonId;
    });
  }),

  on(GameActions.clearParentSelection, (state) =>
    produce(state, (draft) => {
      draft.selectedParent1Id = null;
      draft.selectedParent2Id = null;
    })
  ),

  // confirmBreeding is handled by effects, which dispatches breedingComplete
  on(GameActions.confirmBreeding, (state) => state),

  on(GameActions.breedingComplete, (state, { result }) =>
    produce(state, (draft) => {
      draft.phase = 'result';
      draft.lastBreedingResult = result;
    })
  ),

  on(GameActions.continueFromResult, (state) => {
    if (!state.lastBreedingResult) {
      return state;
    }

    const offspring = state.lastBreedingResult.offspring;
    const winningOffspring = offspring.find((o) =>
      isGoalPigeon(o, state.goalWingGenotype, state.goalTailGenotype)
    );

    return produce(state, (draft) => {
      draft.pigeons.push(...offspring);
      draft.stepsRemaining -= 1;
      draft.selectedParent1Id = null;
      draft.selectedParent2Id = null;

      if (winningOffspring) {
        draft.phase = 'win';
      } else if (draft.stepsRemaining <= 0) {
        draft.phase = 'lose';
      } else {
        draft.phase = 'deck';
      }
    });
  }),

  on(GameActions.resetGame, () => initialGameState)
);
