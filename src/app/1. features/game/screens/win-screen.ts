import { Component, input, output } from '@angular/core';
import { BirdCardComponent } from '../components/bird-card';
import { BirdWithPhenotype, WingGenotype, TailGenotype, WingPhenotype, TailPhenotype } from '../../../3. shared/genetics';

@Component({
  selector: 'app-win-screen',
  standalone: true,
  imports: [BirdCardComponent],
  template: `
    <div class="win-container">
      <div class="celebration">
        <h1>Congratulations!</h1>
        <p class="win-message">You bred the goal bird!</p>
      </div>

      <div class="goal-bird">
        <app-bird-card [bird]="winningBird()!" />
      </div>

      <div class="success-info">
        <h3>You did it!</h3>
        <p>
          By understanding how alleles combine in Punnett squares,
          you successfully bred a bird with <strong>{{ goalWingPhenotype() }} ({{ goalWingGenotype() }})</strong>
          and a <strong>{{ goalTailPhenotype() }} ({{ goalTailGenotype() }})</strong>.
        </p>
      </div>

      <button class="play-again-button" (click)="playAgain.emit()">Play Again</button>
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
  `,
})
export class WinScreenComponent {
  winningBird = input.required<BirdWithPhenotype | null>();
  goalWingGenotype = input.required<WingGenotype>();
  goalTailGenotype = input.required<TailGenotype>();
  goalWingPhenotype = input.required<WingPhenotype>();
  goalTailPhenotype = input.required<TailPhenotype>();

  playAgain = output();
}
