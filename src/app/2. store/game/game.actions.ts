import { createAction, props } from '@ngrx/store';
import { BreedingResult } from './game.state';
import { Bird, Genotypes } from '../../3. shared/genetics';

export const startGame = createAction('[Game] Start Game');

export const gameInitialized = createAction(
  '[Game] Game Initialized',
  props<{
    birds: Bird[];
    goalGenotypes: Genotypes;
    activeTraitSetId: string;
  }>()
);

export const selectParent1 = createAction('[Game] Select Parent 1', props<{ birdId: string }>());

export const selectParent2 = createAction('[Game] Select Parent 2', props<{ birdId: string }>());

export const clearParentSelection = createAction('[Game] Clear Parent Selection');

export const confirmBreeding = createAction('[Game] Confirm Breeding');

export const breedingComplete = createAction(
  '[Game] Breeding Complete',
  props<{ result: BreedingResult }>()
);

export const continueFromResult = createAction('[Game] Continue From Result');

export const resetGame = createAction('[Game] Reset Game');

export const showTutorial = createAction('[Game] Show Tutorial');

export const backToIntro = createAction('[Game] Back To Intro');

// Challenge mode actions
export const startChallengeGame = createAction('[Game] Start Challenge Game');

export const challengeGameInitialized = createAction(
  '[Game] Challenge Game Initialized',
  props<{
    birds: Bird[];
    goalGenotypes: Genotypes;
    activeTraitSetId: string;
  }>()
);

export const challengeRoundComplete = createAction(
  '[Game] Challenge Round Complete',
  props<{ pointsEarned: number }>()
);

export const challengeGameOver = createAction('[Game] Challenge Game Over');
