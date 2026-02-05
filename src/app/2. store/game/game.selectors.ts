import { createFeatureSelector, createSelector } from '@ngrx/store';
import { GameState } from './game.state';
import {
  getBirdWithPhenotype,
  BirdWithPhenotype,
  getTraitConfigsForSet,
  computePhenotypes,
  Genotypes,
  Phenotypes,
  isGoalBird,
  TraitConfig,
} from '../../3. shared/genetics';

export const selectGameState = createFeatureSelector<GameState>('game');

export const selectPhase = createSelector(selectGameState, (state) => state.phase);

export const selectBirds = createSelector(selectGameState, (state) => state.birds);

export const selectActiveTraitSetId = createSelector(
  selectGameState,
  (state) => state.activeTraitSetId
);

export const selectActiveTraitConfigs = createSelector(
  selectActiveTraitSetId,
  (traitSetId): TraitConfig[] => getTraitConfigsForSet(traitSetId)
);

export const selectBirdsWithPhenotype = createSelector(
  selectBirds,
  selectActiveTraitConfigs,
  (birds, traitConfigs): BirdWithPhenotype[] =>
    birds.map((bird) => getBirdWithPhenotype(bird, traitConfigs))
);

export const selectSelectedParent1Id = createSelector(
  selectGameState,
  (state) => state.selectedParent1Id
);

export const selectSelectedParent2Id = createSelector(
  selectGameState,
  (state) => state.selectedParent2Id
);

export const selectSelectedParent1 = createSelector(
  selectBirdsWithPhenotype,
  selectSelectedParent1Id,
  (birds, id) => (id ? birds.find((p) => p.id === id) ?? null : null)
);

export const selectSelectedParent2 = createSelector(
  selectBirdsWithPhenotype,
  selectSelectedParent2Id,
  (birds, id) => (id ? birds.find((p) => p.id === id) ?? null : null)
);

export const selectBothParentsSelected = createSelector(
  selectSelectedParent1Id,
  selectSelectedParent2Id,
  (id1, id2) => id1 !== null && id2 !== null
);

export const selectLastBreedingResult = createSelector(
  selectGameState,
  (state) => state.lastBreedingResult
);

export const selectOffspring = createSelector(
  selectLastBreedingResult,
  selectActiveTraitConfigs,
  (result, traitConfigs) =>
    result ? result.offspring.map((bird) => getBirdWithPhenotype(bird, traitConfigs)) : []
);

export const selectBreedCount = createSelector(
  selectGameState,
  (state) => state.breedCount
);

export const selectGoalGenotypes = createSelector(
  selectGameState,
  (state): Genotypes => state.goalGenotypes
);

export const selectGoalPhenotypes = createSelector(
  selectGoalGenotypes,
  selectActiveTraitConfigs,
  (goalGenotypes, traitConfigs): Phenotypes => {
    const phenotypes: Phenotypes = {};
    for (const config of traitConfigs) {
      const genotype = goalGenotypes[config.id];
      if (genotype) {
        phenotypes[config.id] = config.phenotypes[genotype];
      }
    }
    return phenotypes;
  }
);

export const selectWinningOffspring = createSelector(
  selectOffspring,
  selectGoalGenotypes,
  (offspring, goalGenotypes) => offspring.find((o) => isGoalBird(o, goalGenotypes)) ?? null
);

export const selectCanBreed = createSelector(
  selectBothParentsSelected,
  selectPhase,
  (bothSelected, phase) => bothSelected && phase === 'deck'
);

// Challenge mode selectors
export const selectGameMode = createSelector(
  selectGameState,
  (state) => state.gameMode
);

export const selectChallengeScore = createSelector(
  selectGameState,
  (state) => state.challengeScore
);

export const selectChallengeRound = createSelector(
  selectGameState,
  (state) => state.challengeRound
);

export const selectBreedsRemainingInRound = createSelector(
  selectGameState,
  (state) => state.breedsRemainingInRound
);
