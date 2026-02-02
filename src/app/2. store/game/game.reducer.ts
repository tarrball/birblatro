import { createReducer, on } from '@ngrx/store';
import { GameState, initialGameState, BreedingResult } from './game.state';
import * as GameActions from './game.actions';
import {
  getStartingPigeons,
  generatePunnettSquare,
  calculateBreedingOutcomes,
  selectOffspring,
  isGoalPigeon,
  Pigeon,
  MAX_BREEDING_STEPS,
  GOAL_WING_GENOTYPE,
  GOAL_TAIL_GENOTYPE,
} from '../../3. shared/genetics';

function generateOffspringId(pigeons: Pigeon[]): string {
  const existingIds = new Set(pigeons.map((p) => p.id));
  let counter = 1;
  while (existingIds.has(`offspring-${counter}`)) {
    counter++;
  }
  return `offspring-${counter}`;
}

function performBreeding(parent1: Pigeon, parent2: Pigeon, pigeons: Pigeon[]): BreedingResult {
  const wingSquare = generatePunnettSquare(parent1.wingGenotype, parent2.wingGenotype);
  const tailSquare = generatePunnettSquare(parent1.tailGenotype, parent2.tailGenotype);
  const outcomes = calculateBreedingOutcomes(parent1, parent2);
  const selectedGenotype = selectOffspring(outcomes);

  const offspring: Pigeon = {
    id: generateOffspringId(pigeons),
    wingGenotype: selectedGenotype.wingGenotype,
    tailGenotype: selectedGenotype.tailGenotype,
  };

  return { wingSquare, tailSquare, outcomes, offspring };
}

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

  on(GameActions.confirmBreeding, (state): GameState => {
    if (!state.selectedParent1Id || !state.selectedParent2Id) {
      return state;
    }

    const parent1 = state.pigeons.find((p) => p.id === state.selectedParent1Id);
    const parent2 = state.pigeons.find((p) => p.id === state.selectedParent2Id);

    if (!parent1 || !parent2) {
      return state;
    }

    const breedingResult = performBreeding(parent1, parent2, state.pigeons);

    return {
      ...state,
      phase: 'result',
      lastBreedingResult: breedingResult,
    };
  }),

  on(GameActions.continueFromResult, (state): GameState => {
    if (!state.lastBreedingResult) {
      return state;
    }

    const offspring = state.lastBreedingResult.offspring;
    const newPigeons = [...state.pigeons, offspring];
    const newStepsRemaining = state.stepsRemaining - 1;

    // Check win condition
    if (isGoalPigeon(offspring, GOAL_WING_GENOTYPE, GOAL_TAIL_GENOTYPE)) {
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
