import { Component, input, output, computed } from '@angular/core';
import { BirdCardComponent } from '../components/bird-card';
import { PunnettSquareComponent } from '../components/punnett-square';
import { BreedingResult } from '../../../2. store/game';
import { BirdWithPhenotype, TraitConfig, isGoalBird } from '../../../3. shared/genetics';

@Component({
  selector: 'app-challenge-result-screen',
  standalone: true,
  imports: [BirdCardComponent, PunnettSquareComponent],
  template: `
    <div class="result-container">
      <!-- Challenge stats header -->
      <header class="challenge-header">
        <div class="stat">
          <span class="stat-label">Round</span>
          <span class="stat-value">{{ challengeRound() }}</span>
        </div>
        <div class="stat score">
          <span class="stat-label">Score</span>
          <span class="stat-value">{{ challengeScore() }}</span>
        </div>
        <div class="stat breeds">
          <span class="stat-label">Breeds Left</span>
          <div class="breeds-dots">
            @for (i of [1, 2, 3, 4]; track i) {
              <span
                class="breed-dot"
                [class.active]="i <= breedsRemaining()"
              ></span>
            }
          </div>
        </div>
      </header>

      <h2>Breeding Result</h2>

      <!-- Parents -->
      <div class="parents-section">
        <div class="parent">
          <span class="parent-label">Parent 1</span>
          <app-bird-card [bird]="parent1()!" [traitConfigs]="traitConfigs()" />
        </div>
        <span class="cross-symbol">×</span>
        <div class="parent">
          <span class="parent-label">Parent 2</span>
          <app-bird-card [bird]="parent2()!" [traitConfigs]="traitConfigs()" />
        </div>
      </div>

      <!-- Punnett squares -->
      <div class="punnett-section">
        <h3>Punnett Squares</h3>
        <div class="squares">
          @for (square of breedingResult().squares; track square.traitId) {
            <app-punnett-square [square]="square" [title]="getSquareTitle(square.traitId)" />
          }
        </div>
      </div>

      <!-- Offspring -->
      <div class="offspring-section" [class.success]="hasWinningOffspring()">
        <h3>Offspring</h3>
        @if (hasWinningOffspring()) {
          <div class="success-message">
            <span class="success-icon">★</span>
            Goal Reached! +{{ pointsForWin() }} points
          </div>
        }
        <div class="offspring-grid">
          @for (child of offspring(); track child.id) {
            <app-bird-card
              [bird]="child"
              [traitConfigs]="traitConfigs()"
              [highlightAsOffspring]="isWinningBird(child)"
            />
          }
        </div>
      </div>

      <!-- Continue button -->
      <button class="continue-button" (click)="continueGame.emit()">
        @if (hasWinningOffspring()) {
          Next Round
        } @else if (breedsRemaining() > 1) {
          Continue ({{ breedsRemaining() - 1 }} breeds left)
        } @else {
          View Results
        }
      </button>
    </div>
  `,
  styles: `
    .result-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 24px;
      padding: 16px;
      max-width: 600px;
      margin: 0 auto;
    }

    /* Challenge header */
    .challenge-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: #1f2937;
      border-radius: 12px;
      color: white;
      width: 100%;
    }

    .stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }

    .stat-label {
      font-size: 0.625rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      opacity: 0.7;
    }

    .stat-value {
      font-size: 1.25rem;
      font-weight: 700;
    }

    .stat.score .stat-value {
      color: #fbbf24;
    }

    .breeds-dots {
      display: flex;
      gap: 6px;
    }

    .breed-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #4b5563;
      transition: all 0.2s ease;
    }

    .breed-dot.active {
      background: #10b981;
      box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
    }

    h2 {
      font-size: 1.5rem;
      color: #1f2937;
      margin: 0;
    }

    h3 {
      font-size: 1.125rem;
      color: #374151;
      margin: 0 0 12px 0;
    }

    /* Parents */
    .parents-section {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
      justify-content: center;
    }

    .parent {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      transform: scale(0.8);
    }

    .parent-label {
      font-size: 0.75rem;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .cross-symbol {
      font-size: 1.5rem;
      color: #9ca3af;
      font-weight: 300;
    }

    /* Punnett squares */
    .punnett-section {
      background: #f9fafb;
      border-radius: 12px;
      padding: 16px;
      width: 100%;
      text-align: center;
    }

    .squares {
      display: flex;
      justify-content: center;
      gap: 24px;
      flex-wrap: wrap;
    }

    /* Offspring */
    .offspring-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      background: #f3f4f6;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      padding: 16px;
      width: 100%;
    }

    .offspring-section.success {
      background: #ecfdf5;
      border-color: #10b981;
    }

    .offspring-section h3 {
      color: #374151;
      margin: 0;
    }

    .offspring-section.success h3 {
      color: #065f46;
    }

    .success-message {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1.125rem;
      font-weight: 600;
      color: #059669;
    }

    .success-icon {
      font-size: 1.5rem;
      color: #fbbf24;
    }

    .offspring-grid {
      display: flex;
      gap: 16px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .offspring-grid app-bird-card {
      transform: scale(0.85);
    }

    /* Continue button */
    .continue-button {
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 16px 32px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      width: 100%;
      max-width: 300px;
    }

    .continue-button:hover {
      background: #2563eb;
      transform: scale(1.02);
    }

    @media (min-width: 768px) {
      .result-container {
        padding: 24px;
      }

      .parent {
        transform: scale(0.9);
      }

      .offspring-grid app-bird-card {
        transform: scale(0.9);
      }
    }
  `,
})
export class ChallengeResultScreenComponent {
  breedingResult = input.required<BreedingResult>();
  parent1 = input.required<BirdWithPhenotype | null>();
  parent2 = input.required<BirdWithPhenotype | null>();
  offspring = input.required<BirdWithPhenotype[]>();
  traitConfigs = input.required<TraitConfig[]>();
  goalGenotypes = input.required<Record<string, string>>();
  challengeRound = input.required<number>();
  challengeScore = input.required<number>();
  breedsRemaining = input.required<number>();

  continueGame = output();

  private traitConfigMap = computed(() => {
    const map = new Map<string, TraitConfig>();
    for (const config of this.traitConfigs()) {
      map.set(config.id, config);
    }
    return map;
  });

  hasWinningOffspring = computed(() => {
    return this.offspring().some((o) => isGoalBird(o, this.goalGenotypes()));
  });

  pointsForWin = computed(() => {
    return this.breedsRemaining() * 100;
  });

  isWinningBird(bird: BirdWithPhenotype): boolean {
    return isGoalBird(bird, this.goalGenotypes());
  }

  getSquareTitle(traitId: string): string {
    const config = this.traitConfigMap().get(traitId);
    if (!config) return traitId;
    return `${config.displayName} (${config.alleles.dominant}/${config.alleles.recessive})`;
  }
}
