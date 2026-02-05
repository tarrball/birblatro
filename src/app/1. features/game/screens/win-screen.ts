import { Component, input, output, computed } from '@angular/core';
import { BirdCardComponent } from '../components/bird-card';
import { BirdWithPhenotype, Genotypes, Phenotypes, TraitConfig } from '../../../3. shared/genetics';
import { GameMode } from '../../../2. store/game';

@Component({
  selector: 'app-win-screen',
  standalone: true,
  imports: [BirdCardComponent],
  template: `
    <div class="win-container">
      @if (gameMode() === 'challenge') {
        <!-- Challenge mode header -->
        <header class="challenge-header">
          <div class="stat">
            <span class="stat-label">Round Complete</span>
            <span class="stat-value">{{ challengeRound() }}</span>
          </div>
          <div class="stat score">
            <span class="stat-label">Total Score</span>
            <span class="stat-value">{{ challengeScore() }}</span>
          </div>
        </header>
      }

      <div class="celebration">
        <h1>{{ gameMode() === 'challenge' ? 'Round Complete!' : 'Congratulations!' }}</h1>
        <p class="win-message">You bred the goal bird!</p>
        @if (gameMode() === 'challenge') {
          <p class="points-earned">+{{ pointsEarned() }} points</p>
        }
      </div>

      <div class="goal-bird">
        <app-bird-card [bird]="winningBird()!" [traitConfigs]="traitConfigs()" />
      </div>

      <div class="success-info">
        <h3>You did it!</h3>
        <p>
          By understanding how alleles combine in Punnett squares,
          you successfully bred a bird with <span [innerHTML]="goalDescription()"></span>.
        </p>
      </div>

      @if (gameMode() === 'challenge') {
        <button class="next-round-button" (click)="nextRound.emit()">Next Round</button>
      } @else {
        <button class="play-again-button" (click)="playAgain.emit()">Play Again</button>
      }
    </div>
  `,
  styles: `
    .win-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 32px;
      padding: 48px 24px;
      max-width: 600px;
      margin: 0 auto;
      text-align: center;
    }

    .celebration h1 {
      font-size: 2.5rem;
      color: #059669;
      margin: 0;
    }

    .win-message {
      font-size: 1.25rem;
      color: #047857;
      margin: 8px 0 0 0;
    }

    .goal-bird {
      padding: 24px;
      background: linear-gradient(135deg, #ecfdf5, #d1fae5);
      border-radius: 16px;
      box-shadow: 0 8px 24px rgba(16, 185, 129, 0.2);
    }

    .success-info {
      background: #f0fdf4;
      border: 1px solid #86efac;
      border-radius: 12px;
      padding: 24px;
      max-width: 400px;
    }

    .success-info h3 {
      color: #166534;
      margin: 0 0 12px 0;
    }

    .success-info p {
      color: #15803d;
      margin: 0;
      line-height: 1.6;
    }

    .play-again-button {
      background: #059669;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 16px 48px;
      font-size: 1.125rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .play-again-button:hover {
      background: #047857;
    }

    /* Challenge mode styles */
    .challenge-header {
      display: flex;
      justify-content: center;
      gap: 48px;
      padding: 16px 24px;
      background: #1f2937;
      border-radius: 12px;
      color: white;
      width: 100%;
      max-width: 400px;
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
      font-size: 1.5rem;
      font-weight: 700;
    }

    .stat.score .stat-value {
      color: #fbbf24;
    }

    .points-earned {
      font-size: 1.5rem;
      font-weight: 700;
      color: #fbbf24;
      margin: 8px 0 0 0;
    }

    .next-round-button {
      background: #8b5cf6;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 16px 48px;
      font-size: 1.125rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .next-round-button:hover {
      background: #7c3aed;
    }
  `,
})
export class WinScreenComponent {
  winningBird = input.required<BirdWithPhenotype | null>();
  goalGenotypes = input.required<Genotypes>();
  goalPhenotypes = input.required<Phenotypes>();
  traitConfigs = input.required<TraitConfig[]>();

  // Challenge mode inputs (optional)
  gameMode = input<GameMode>('standard');
  challengeScore = input<number>(0);
  challengeRound = input<number>(1);
  breedsRemaining = input<number>(4);

  playAgain = output();
  nextRound = output();

  goalDescription = computed(() => {
    return this.traitConfigs()
      .map((config) => {
        const phenotype = this.goalPhenotypes()[config.id];
        const genotype = this.goalGenotypes()[config.id];
        return `<strong>${phenotype} (${genotype})</strong>`;
      })
      .join(' and ');
  });

  pointsEarned = computed(() => {
    return this.breedsRemaining() * 100;
  });
}
