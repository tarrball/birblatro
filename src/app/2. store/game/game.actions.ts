import { createAction, props } from '@ngrx/store';
import { BreedingResult } from './game.state';

export const startGame = createAction('[Game] Start Game');

export const selectParent1 = createAction('[Game] Select Parent 1', props<{ pigeonId: string }>());

export const selectParent2 = createAction('[Game] Select Parent 2', props<{ pigeonId: string }>());

export const clearParentSelection = createAction('[Game] Clear Parent Selection');

export const confirmBreeding = createAction('[Game] Confirm Breeding');

export const breedingComplete = createAction(
  '[Game] Breeding Complete',
  props<{ result: BreedingResult }>()
);

export const continueFromResult = createAction('[Game] Continue From Result');

export const resetGame = createAction('[Game] Reset Game');
