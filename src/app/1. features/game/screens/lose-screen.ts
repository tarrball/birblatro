import { Component, input, output, computed } from '@angular/core';
import { Genotypes, TraitConfig } from '../../../3. shared/genetics';
import { GameMode } from '../../../2. store/game';

@Component({
  selector: 'app-lose-screen',
  standalone: true,
  template: `
    <div class="lose-container">
      @if (gameMode() === 'challenge') {
        <!-- Challenge mode final results -->
        <header class="challenge-header">
          <div class="stat">
            <span class="stat-label">Rounds Completed</span>
            <span class="stat-value">{{ challengeRound() - 1 }}</span>
          </div>
          <div class="stat score">
            <span class="stat-label">Final Score</span>
            <span class="stat-value">{{ challengeScore() }}</span>
          </div>
        </header>
      }

      <div class="message">
        <h1>{{ gameMode() === 'challenge' ? 'Game Over!' : 'Out of Steps!' }}</h1>
        <p class="lose-message">
          @if (gameMode() === 'challenge') {
            You ran out of breeds before reaching the goal.
          } @else {
            You ran out of breeding steps before reaching the goal.
          }
        </p>
      </div>

      <div class="tip-box">
        <h3>Tip for Next Time</h3>
        <p>
          Think about which parent combinations give you the best chance
          of getting closer to the goal genotype <strong>{{ goalGenotypesDisplay() }}</strong>.
        </p>
        <p class="hint">
          Remember: Homozygous parents (like WW × WW) always produce that same genotype in offspring!
        </p>
      </div>

      <button class="try-again-button" (click)="tryAgain.emit()">
        {{ gameMode() === 'challenge' ? 'Play Again' : 'Try Again' }}
      </button>
    </div>
  `,
  styles: `
    .lose-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 32px;
      padding: 48px 24px;
      max-width: 600px;
      margin: 0 auto;
      text-align: center;
    }

    .message h1 {
      font-size: 2rem;
      color: #dc2626;
      margin: 0;
    }

    .lose-message {
      font-size: 1.125rem;
      color: #7f1d1d;
      margin: 8px 0 0 0;
    }

    .tip-box {
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 12px;
      padding: 24px;
      max-width: 450px;
    }

    .tip-box h3 {
      color: #991b1b;
      margin: 0 0 12px 0;
    }

    .tip-box p {
      color: #b91c1c;
      margin: 0 0 12px 0;
      line-height: 1.6;
    }

    .hint {
      font-size: 0.875rem;
      font-style: italic;
      opacity: 0.9;
    }

    .try-again-button {
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 16px 48px;
      font-size: 1.125rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .try-again-button:hover {
      background: #2563eb;
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
  `,
})
export class LoseScreenComponent {
  goalGenotypes = input.required<Genotypes>();
  traitConfigs = input.required<TraitConfig[]>();

  // Challenge mode inputs (optional)
  gameMode = input<GameMode>('standard');
  challengeScore = input<number>(0);
  challengeRound = input<number>(1);

  tryAgain = output();

  goalGenotypesDisplay = computed(() =>
    this.traitConfigs()
      .map((config) => this.goalGenotypes()[config.id])
      .join(' ')
  );
}
