import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { map, withLatestFrom, filter } from 'rxjs/operators';

import * as GameActions from './game.actions';
import { selectPigeons, selectSelectedParent1Id, selectSelectedParent2Id } from './game.selectors';
import { BreedingResult } from './game.state';
import {
  generatePunnettSquare,
  calculateBreedingOutcomes,
  selectOffspring,
  Pigeon,
} from '../../3. shared/genetics';
import { RngService } from '../../3. shared/services';

function generateOffspringIds(pigeons: Pigeon[], count: number): string[] {
  const existingIds = new Set(pigeons.map((p) => p.id));
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

  confirmBreeding$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GameActions.confirmBreeding),
      withLatestFrom(
        this.store.select(selectPigeons),
        this.store.select(selectSelectedParent1Id),
        this.store.select(selectSelectedParent2Id)
      ),
      filter(([, , parent1Id, parent2Id]) => parent1Id !== null && parent2Id !== null),
      map(([, pigeons, parent1Id, parent2Id]) => {
        const parent1 = pigeons.find((p) => p.id === parent1Id)!;
        const parent2 = pigeons.find((p) => p.id === parent2Id)!;

        const wingSquare = generatePunnettSquare(parent1.wingGenotype, parent2.wingGenotype);
        const tailSquare = generatePunnettSquare(parent1.tailGenotype, parent2.tailGenotype);
        const outcomes = calculateBreedingOutcomes(parent1, parent2);

        // Use RNG service for probability-based selection
        const selectedGenotypes = selectOffspring(outcomes, 2, () => this.rng.random());
        const ids = generateOffspringIds(pigeons, selectedGenotypes.length);

        const offspring: Pigeon[] = selectedGenotypes.map((genotype, index) => ({
          id: ids[index],
          wingGenotype: genotype.wingGenotype,
          tailGenotype: genotype.tailGenotype,
          parentId1: parent1.id,
          parentId2: parent2.id,
        }));

        const result: BreedingResult = { wingSquare, tailSquare, outcomes, offspring };

        return GameActions.breedingComplete({ result });
      })
    )
  );
}
