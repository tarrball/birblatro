import { Component, inject, effect, ElementRef, AfterViewInit } from '@angular/core';
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
  selectGameMode,
  selectChallengeScore,
  selectChallengeRound,
  selectBreedsRemainingInRound,
  startGame,
  startChallengeGame,
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
import { StartingScreenComponent } from './screens/starting-screen';
import { DeckScreenComponent } from './screens/deck-screen';
import { ResultScreenComponent } from './screens/result-screen';
import { WinScreenComponent } from './screens/win-screen';
import { LoseScreenComponent } from './screens/lose-screen';
import { ChallengeDeckScreenComponent } from './screens/challenge-deck-screen';
import { ChallengeResultScreenComponent } from './screens/challenge-result-screen';
import { getTraitConfigsForSet, DEFAULT_TRAIT_SET_ID } from '../../3. shared/genetics';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [
    IntroScreenComponent,
    TutorialScreenComponent,
    StartingScreenComponent,
    DeckScreenComponent,
    ResultScreenComponent,
    WinScreenComponent,
    LoseScreenComponent,
    ChallengeDeckScreenComponent,
    ChallengeResultScreenComponent,
  ],
  template: `
    <a href="#main-content" class="skip-link">Skip to main content</a>
    <div id="main-content" #mainContent tabindex="-1">
      @switch (phase()) {
        @case ('intro') {
          <app-intro-screen
            (startGame)="onStartGame()"
            (showTutorial)="onShowTutorial()"
            (startChallengeGame)="onStartChallengeGame()"
          />
        }
        @case ('tutorial') {
          <app-tutorial-screen (startGame)="onStartGame()" (backToIntro)="onBackToIntro()" />
        }
        @case ('starting') {
          <app-starting-screen />
        }
        @case ('deck') {
          @if (gameMode() === 'challenge') {
            <app-challenge-deck-screen
              [birds]="birds()"
              [selectedParent1]="selectedParent1()"
              [selectedParent2]="selectedParent2()"
              [goalGenotypes]="goalGenotypes()"
              [goalPhenotypes]="goalPhenotypes()"
              [traitConfigs]="traitConfigs()"
              [canBreed]="canBreed()"
              [challengeRound]="challengeRound()"
              [challengeScore]="challengeScore()"
              [breedsRemaining]="breedsRemaining()"
              (selectParent1)="onSelectParent1($event)"
              (selectParent2)="onSelectParent2($event)"
              (clearSelection)="onClearSelection()"
              (confirmBreeding)="onConfirmBreeding()"
            />
          } @else {
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
        }
        @case ('result') {
          @if (breedingResult(); as result) {
            @if (gameMode() === 'challenge') {
              <app-challenge-result-screen
                [breedingResult]="result"
                [parent1]="selectedParent1()"
                [parent2]="selectedParent2()"
                [offspring]="offspring()"
                [traitConfigs]="traitConfigs()"
                [goalGenotypes]="goalGenotypes()"
                [challengeRound]="challengeRound()"
                [challengeScore]="challengeScore()"
                [breedsRemaining]="breedsRemaining()"
                (continueGame)="onContinue()"
              />
            } @else {
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
        }
        @case ('win') {
          <app-win-screen
            [winningBird]="winningOffspring()"
            [goalGenotypes]="goalGenotypes()"
            [goalPhenotypes]="goalPhenotypes()"
            [traitConfigs]="traitConfigs()"
            [gameMode]="gameMode()"
            [challengeScore]="challengeScore()"
            [challengeRound]="challengeRound()"
            [breedsRemaining]="breedsRemaining()"
            (playAgain)="onReset()"
            (nextRound)="onNextRound()"
          />
        }
        @case ('lose') {
          <app-lose-screen
            [goalGenotypes]="goalGenotypes()"
            [traitConfigs]="traitConfigs()"
            [gameMode]="gameMode()"
            [challengeScore]="challengeScore()"
            [challengeRound]="challengeRound()"
            (tryAgain)="onReset()"
          />
        }
      }
    </div>
    <div aria-live="polite" aria-atomic="true" class="sr-only">
      {{ screenAnnouncementText() }}
    </div>
  `,
  styles: `
    :host {
      display: block;
      min-height: 100vh;
      background: #f9fafb;
    }

    #main-content:focus {
      outline: none;
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
  `,
})
export class GameComponent {
  private store = inject(Store);
  private elementRef = inject(ElementRef);

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

  // Challenge mode state
  gameMode = toSignal(this.store.select(selectGameMode), { initialValue: 'standard' as const });
  challengeScore = toSignal(this.store.select(selectChallengeScore), { initialValue: 0 });
  challengeRound = toSignal(this.store.select(selectChallengeRound), { initialValue: 1 });
  breedsRemaining = toSignal(this.store.select(selectBreedsRemainingInRound), { initialValue: 4 });

  private previousPhase: string | null = null;

  // Screen announcements for screen readers
  screenAnnouncementText = () => {
    const phase = this.phase();
    const announcements: Record<string, string> = {
      intro: 'Welcome to UBG, the Untitled Bird-breeding Game. Press Start Game to begin or How to Play to learn.',
      tutorial: 'How to Play screen. Learn about genetics and Punnett squares.',
      starting: 'Creating your game. Please wait.',
      deck: 'Game started. Select two parent birds to breed.',
      result: 'Breeding results. See your offspring.',
      win: 'Congratulations! You won!',
      lose: 'Game over. Try again.',
    };
    return announcements[phase] || '';
  };

  constructor() {
    // Focus management on phase changes
    effect(() => {
      const currentPhase = this.phase();
      if (this.previousPhase !== null && this.previousPhase !== currentPhase) {
        // Delay to allow DOM to update
        setTimeout(() => {
          const mainContent = this.elementRef.nativeElement.querySelector('#main-content');
          if (mainContent) {
            mainContent.focus();
          }
        }, 100);
      }
      this.previousPhase = currentPhase;
    });
  }

  onStartGame() {
    this.store.dispatch(startGame());
  }

  onStartChallengeGame() {
    this.store.dispatch(startChallengeGame());
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
    // For challenge mode lose screen, start a new challenge game
    if (this.gameMode() === 'challenge') {
      this.store.dispatch(startChallengeGame());
    } else {
      this.store.dispatch(startGame());
    }
  }

  onNextRound() {
    // Start next challenge round
    this.store.dispatch(startChallengeGame());
  }
}
