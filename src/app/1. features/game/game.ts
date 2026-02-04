import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';

import {
  selectPhase,
  selectBirdsWithPhenotype,
  selectSelectedParent1,
  selectSelectedParent2,
  selectBreedCount,
  selectGoalGenotypes,
  selectGoalPhenotypes,
  selectCanBreed,
  selectLastBreedingResult,
  selectOffspring,
  selectWinningOffspring,
  selectActiveTraitConfigs,
  startGame,
  selectParent1,
  selectParent2,
  clearParentSelection,
  confirmBreeding,
  continueFromResult,
  showTutorial,
  backToIntro,
} from '../../2. store/game';

import { IntroScreenComponent } from './screens/intro-screen';
import { TutorialScreenComponent } from './screens/tutorial-screen';
import { DeckScreenComponent } from './screens/deck-screen';
import { ResultScreenComponent } from './screens/result-screen';
import { WinScreenComponent } from './screens/win-screen';
import { LoseScreenComponent } from './screens/lose-screen';
import { getTraitConfigsForSet, DEFAULT_TRAIT_SET_ID } from '../../3. shared/genetics';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [
    IntroScreenComponent,
    TutorialScreenComponent,
    DeckScreenComponent,
    ResultScreenComponent,
    WinScreenComponent,
    LoseScreenComponent,
  ],
  template: `
    @switch (phase()) {
      @case ('intro') {
        <app-intro-screen (startGame)="onStartGame()" (showTutorial)="onShowTutorial()" />
      }
      @case ('tutorial') {
        <app-tutorial-screen (startGame)="onStartGame()" (backToIntro)="onBackToIntro()" />
      }
      @case ('deck') {
        <app-deck-screen
          [birds]="birds()"
          [selectedParent1]="selectedParent1()"
          [selectedParent2]="selectedParent2()"
          [breedCount]="breedCount()"
          [goalGenotypes]="goalGenotypes()"
          [goalPhenotypes]="goalPhenotypes()"
          [traitConfigs]="traitConfigs()"
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
            [traitConfigs]="traitConfigs()"
            (continueGame)="onContinue()"
          />
        }
      }
      @case ('win') {
        <app-win-screen
          [winningBird]="winningOffspring()"
          [goalGenotypes]="goalGenotypes()"
          [goalPhenotypes]="goalPhenotypes()"
          [traitConfigs]="traitConfigs()"
          (playAgain)="onReset()"
        />
      }
      @case ('lose') {
        <app-lose-screen
          [goalGenotypes]="goalGenotypes()"
          [traitConfigs]="traitConfigs()"
          (tryAgain)="onReset()"
        />
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
  birds = toSignal(this.store.select(selectBirdsWithPhenotype), { initialValue: [] });
  selectedParent1 = toSignal(this.store.select(selectSelectedParent1), { initialValue: null });
  selectedParent2 = toSignal(this.store.select(selectSelectedParent2), { initialValue: null });
  breedCount = toSignal(this.store.select(selectBreedCount), { initialValue: 0 });
  goalGenotypes = toSignal(this.store.select(selectGoalGenotypes), {
    initialValue: { wing: 'WW', tail: 'TT' },
  });
  goalPhenotypes = toSignal(this.store.select(selectGoalPhenotypes), {
    initialValue: { wing: 'Large wings', tail: 'Fan tail' },
  });
  traitConfigs = toSignal(this.store.select(selectActiveTraitConfigs), {
    initialValue: getTraitConfigsForSet(DEFAULT_TRAIT_SET_ID),
  });
  canBreed = toSignal(this.store.select(selectCanBreed), { initialValue: false });
  breedingResult = toSignal(this.store.select(selectLastBreedingResult), { initialValue: null });
  offspring = toSignal(this.store.select(selectOffspring), { initialValue: [] });
  winningOffspring = toSignal(this.store.select(selectWinningOffspring), { initialValue: null });

  onStartGame() {
    this.store.dispatch(startGame());
  }

  onShowTutorial() {
    this.store.dispatch(showTutorial());
  }

  onBackToIntro() {
    this.store.dispatch(backToIntro());
  }

  onSelectParent1(birdId: string) {
    this.store.dispatch(selectParent1({ birdId }));
  }

  onSelectParent2(birdId: string) {
    this.store.dispatch(selectParent2({ birdId }));
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
    this.store.dispatch(startGame());
  }
}
