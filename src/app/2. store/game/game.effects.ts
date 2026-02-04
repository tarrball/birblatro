import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { map, withLatestFrom, filter, delay } from 'rxjs/operators';

import * as GameActions from './game.actions';
import {
  selectBirds,
  selectSelectedParent1Id,
  selectSelectedParent2Id,
  selectActiveTraitSetId,
  selectActiveTraitConfigs,
} from './game.selectors';
import { BreedingResult } from './game.state';
import {
  generatePunnettSquares,
  calculateBreedingOutcomes,
  selectOffspring,
  getRandomGoal,
  getRandomStartingBirds,
  getTraitConfigsForSet,
  isGoalReachable,
  Bird,
  createBird,
  DEFAULT_TRAIT_SET_ID,
} from '../../3. shared/genetics';
import { RngService } from '../../3. shared/services';

function generateOffspringIds(birds: Bird[], count: number): string[] {
  const existingIds = new Set(birds.map((p) => p.id));
  const ids: string[] = [];
  let counter = 1;

  while (ids.length < count) {
    const id = `offspring-${counter}`;
    if (!existingIds.has(id)) {
      ids.push(id);
      existingIds.add(id);
    }
    counter++;
  }

  return ids;
}

@Injectable()
export class GameEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);
  private rng = inject(RngService);

  startGame$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GameActions.startGame),
      map(() => {
        const traitSetId = DEFAULT_TRAIT_SET_ID;
        const traitConfigs = getTraitConfigsForSet(traitSetId);
        const maxAttempts = 100;

        let goalGenotypes;
        let birds;
        let attempts = 0;

        // Keep generating until we find a valid (winnable) game
        do {
          goalGenotypes = getRandomGoal(traitSetId, () => this.rng.random());
          birds = getRandomStartingBirds(goalGenotypes, traitSetId, () => this.rng.random());
          attempts++;
        } while (
          !isGoalReachable(birds, goalGenotypes, traitConfigs) &&
          attempts < maxAttempts
        );

        // Log if we hit max attempts (shouldn't happen with proper allele coverage)
        if (attempts >= maxAttempts) {
          console.warn(`Game validation reached max attempts (${maxAttempts})`);
        }

        return GameActions.gameInitialized({
          birds,
          goalGenotypes,
          activeTraitSetId: traitSetId,
        });
      }),
      delay(1500) // Show spinner for at least 1.5s
    )
  );

  confirmBreeding$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GameActions.confirmBreeding),
      withLatestFrom(
        this.store.select(selectBirds),
        this.store.select(selectSelectedParent1Id),
        this.store.select(selectSelectedParent2Id),
        this.store.select(selectActiveTraitConfigs)
      ),
      filter(([, , parent1Id, parent2Id]) => parent1Id !== null && parent2Id !== null),
      map(([, birds, parent1Id, parent2Id, traitConfigs]) => {
        const parent1 = birds.find((p) => p.id === parent1Id)!;
        const parent2 = birds.find((p) => p.id === parent2Id)!;

        const squares = generatePunnettSquares(parent1, parent2, traitConfigs);
        const outcomes = calculateBreedingOutcomes(parent1, parent2, traitConfigs);

        // Use RNG service for probability-based selection
        const selectedGenotypes = selectOffspring(outcomes, 2, () => this.rng.random());
        const ids = generateOffspringIds(birds, selectedGenotypes.length);

        const offspring: Bird[] = selectedGenotypes.map((genotypes, index) =>
          createBird(ids[index], genotypes, parent1.id, parent2.id)
        );

        const result: BreedingResult = { squares, outcomes, offspring };

        return GameActions.breedingComplete({ result });
      })
    )
  );
}
