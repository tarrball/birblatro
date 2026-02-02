import { createFeatureSelector, createSelector } from '@ngrx/store';
import { GameState } from './game.state';
import { getPigeonWithPhenotype, PigeonWithPhenotype, getWingPhenotype, getTailPhenotype } from '../../3. shared/genetics';

export const selectGameState = createFeatureSelector<GameState>('game');

export const selectPhase = createSelector(selectGameState, (state) => state.phase);

export const selectPigeons = createSelector(selectGameState, (state) => state.pigeons);

export const selectPigeonsWithPhenotype = createSelector(selectPigeons, (pigeons): PigeonWithPhenotype[] =>
  pigeons.map(getPigeonWithPhenotype)
);

export const selectSelectedParent1Id = createSelector(selectGameState, (state) => state.selectedParent1Id);

export const selectSelectedParent2Id = createSelector(selectGameState, (state) => state.selectedParent2Id);

export const selectSelectedParent1 = createSelector(selectPigeonsWithPhenotype, selectSelectedParent1Id, (pigeons, id) =>
  id ? pigeons.find((p) => p.id === id) ?? null : null
);

export const selectSelectedParent2 = createSelector(selectPigeonsWithPhenotype, selectSelectedParent2Id, (pigeons, id) =>
  id ? pigeons.find((p) => p.id === id) ?? null : null
);

export const selectBothParentsSelected = createSelector(
  selectSelectedParent1Id,
  selectSelectedParent2Id,
  (id1, id2) => id1 !== null && id2 !== null
);

export const selectLastBreedingResult = createSelector(selectGameState, (state) => state.lastBreedingResult);

export const selectOffspring = createSelector(selectLastBreedingResult, (result) =>
  result ? result.offspring.map(getPigeonWithPhenotype) : []
);

export const selectStepsRemaining = createSelector(selectGameState, (state) => state.stepsRemaining);

export const selectGoalGenotype = createSelector(selectGameState, (state) => ({
  wingGenotype: state.goalWingGenotype,
  tailGenotype: state.goalTailGenotype,
}));

export const selectGoalPhenotype = createSelector(selectGoalGenotype, (goal) => ({
  wingPhenotype: getWingPhenotype(goal.wingGenotype),
  tailPhenotype: getTailPhenotype(goal.tailGenotype),
}));

export const selectWinningOffspring = createSelector(
  selectOffspring,
  selectGoalGenotype,
  (offspring, goal) =>
    offspring.find((o) => o.wingGenotype === goal.wingGenotype && o.tailGenotype === goal.tailGenotype) ?? null
);

export const selectCanBreed = createSelector(
  selectBothParentsSelected,
  selectStepsRemaining,
  selectPhase,
  (bothSelected, steps, phase) => bothSelected && steps > 0 && phase === 'deck'
);
