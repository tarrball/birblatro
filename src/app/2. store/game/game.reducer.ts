import { createReducer, on } from '@ngrx/store';
import { GameState, initialGameState } from './game.state';
import * as GameActions from './game.actions';
import {
  getStartingPigeons,
  isGoalPigeon,
  MAX_BREEDING_STEPS,
  GOAL_WING_GENOTYPE,
  GOAL_TAIL_GENOTYPE,
} from '../../3. shared/genetics';

export const gameReducer = createReducer(
  initialGameState,

  on(GameActions.startGame, (state): GameState => {
    return {
      ...state,
      phase: 'deck',
      pigeons: getStartingPigeons(),
      selectedParent1Id: null,
      selectedParent2Id: null,
      lastBreedingResult: null,
      stepsRemaining: MAX_BREEDING_STEPS,
    };
  }),

  on(GameActions.selectParent1, (state, { pigeonId }): GameState => {
    if (pigeonId === state.selectedParent2Id) {
      return state;
    }
    return {
      ...state,
      selectedParent1Id: pigeonId,
    };
  }),

  on(GameActions.selectParent2, (state, { pigeonId }): GameState => {
    if (pigeonId === state.selectedParent1Id) {
      return state;
    }
    return {
      ...state,
      selectedParent2Id: pigeonId,
    };
  }),

  on(GameActions.clearParentSelection, (state): GameState => {
    return {
      ...state,
      selectedParent1Id: null,
      selectedParent2Id: null,
    };
  }),

  // confirmBreeding is handled by effects, which dispatches breedingComplete
  on(GameActions.confirmBreeding, (state): GameState => state),

  on(GameActions.breedingComplete, (state, { result }): GameState => {
    return {
      ...state,
      phase: 'result',
      lastBreedingResult: result,
    };
  }),

  on(GameActions.continueFromResult, (state): GameState => {
    if (!state.lastBreedingResult) {
      return state;
    }

    const offspring = state.lastBreedingResult.offspring;
    const newPigeons = [...state.pigeons, ...offspring];
    const newStepsRemaining = state.stepsRemaining - 1;

    // Check win condition - any offspring matching the goal wins
    const winningOffspring = offspring.find((o) => isGoalPigeon(o, GOAL_WING_GENOTYPE, GOAL_TAIL_GENOTYPE));
    if (winningOffspring) {
      return {
        ...state,
        phase: 'win',
        pigeons: newPigeons,
        selectedParent1Id: null,
        selectedParent2Id: null,
        stepsRemaining: newStepsRemaining,
      };
    }

    // Check lose condition
    if (newStepsRemaining <= 0) {
      return {
        ...state,
        phase: 'lose',
        pigeons: newPigeons,
        selectedParent1Id: null,
        selectedParent2Id: null,
        stepsRemaining: newStepsRemaining,
      };
    }

    // Continue playing
    return {
      ...state,
      phase: 'deck',
      pigeons: newPigeons,
      selectedParent1Id: null,
      selectedParent2Id: null,
      stepsRemaining: newStepsRemaining,
    };
  }),

  on(GameActions.resetGame, (): GameState => {
    return initialGameState;
  })
);
