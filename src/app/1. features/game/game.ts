import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';

import {
  selectPhase,
  selectPigeonsWithPhenotype,
  selectSelectedParent1,
  selectSelectedParent2,
  selectStepsRemaining,
  selectGoalGenotype,
  selectGoalPhenotype,
  selectCanBreed,
  selectLastBreedingResult,
  selectOffspring,
  selectWinningOffspring,
  startGame,
  selectParent1,
  selectParent2,
  clearParentSelection,
  confirmBreeding,
  continueFromResult,
  resetGame,
} from '../../2. store/game';

import { IntroScreenComponent } from './screens/intro-screen';
import { DeckScreenComponent } from './screens/deck-screen';
import { ResultScreenComponent } from './screens/result-screen';
import { WinScreenComponent } from './screens/win-screen';
import { LoseScreenComponent } from './screens/lose-screen';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [IntroScreenComponent, DeckScreenComponent, ResultScreenComponent, WinScreenComponent, LoseScreenComponent],
  template: `
    @switch (phase()) {
      @case ('intro') {
        <app-intro-screen (startGame)="onStartGame()" />
      }
      @case ('deck') {
        <app-deck-screen
          [pigeons]="pigeons()"
          [selectedParent1]="selectedParent1()"
          [selectedParent2]="selectedParent2()"
          [stepsRemaining]="stepsRemaining()"
          [goalWingGenotype]="goalGenotype().wingGenotype"
          [goalTailGenotype]="goalGenotype().tailGenotype"
          [goalWingPhenotype]="goalPhenotype().wingPhenotype"
          [goalTailPhenotype]="goalPhenotype().tailPhenotype"
          [canBreed]="canBreed()"
          (selectParent1)="onSelectParent1($event)"
          (selectParent2)="onSelectParent2($event)"
          (clearSelection)="onClearSelection()"
          (confirmBreeding)="onConfirmBreeding()"
        />
      }
      @case ('result') {
        @if (breedingResult(); as result) {
          <app-result-screen
            [breedingResult]="result"
            [parent1]="selectedParent1()"
            [parent2]="selectedParent2()"
            [offspring]="offspring()"
            (continueGame)="onContinue()"
          />
        }
      }
      @case ('win') {
        <app-win-screen [winningPigeon]="winningOffspring()" (playAgain)="onReset()" />
      }
      @case ('lose') {
        <app-lose-screen (tryAgain)="onReset()" />
      }
    }
  `,
  styles: `
    :host {
      display: block;
      min-height: 100vh;
      background: #f9fafb;
    }
  `,
})
export class GameComponent {
  private store = inject(Store);

  phase = toSignal(this.store.select(selectPhase), { initialValue: 'intro' as const });
  pigeons = toSignal(this.store.select(selectPigeonsWithPhenotype), { initialValue: [] });
  selectedParent1 = toSignal(this.store.select(selectSelectedParent1), { initialValue: null });
  selectedParent2 = toSignal(this.store.select(selectSelectedParent2), { initialValue: null });
  stepsRemaining = toSignal(this.store.select(selectStepsRemaining), { initialValue: 3 });
  goalGenotype = toSignal(this.store.select(selectGoalGenotype), { initialValue: { wingGenotype: 'WW' as const, tailGenotype: 'TT' as const } });
  goalPhenotype = toSignal(this.store.select(selectGoalPhenotype), { initialValue: { wingPhenotype: 'Large wings' as const, tailPhenotype: 'Fan tail' as const } });
  canBreed = toSignal(this.store.select(selectCanBreed), { initialValue: false });
  breedingResult = toSignal(this.store.select(selectLastBreedingResult), { initialValue: null });
  offspring = toSignal(this.store.select(selectOffspring), { initialValue: [] });
  winningOffspring = toSignal(this.store.select(selectWinningOffspring), { initialValue: null });

  onStartGame() {
    this.store.dispatch(startGame());
  }

  onSelectParent1(pigeonId: string) {
    this.store.dispatch(selectParent1({ pigeonId }));
  }

  onSelectParent2(pigeonId: string) {
    this.store.dispatch(selectParent2({ pigeonId }));
  }

  onClearSelection() {
    this.store.dispatch(clearParentSelection());
  }

  onConfirmBreeding() {
    this.store.dispatch(confirmBreeding());
  }

  onContinue() {
    this.store.dispatch(continueFromResult());
  }

  onReset() {
    this.store.dispatch(resetGame());
  }
}
