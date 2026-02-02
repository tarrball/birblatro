import { Component, input, output } from '@angular/core';
import { WingGenotype, TailGenotype } from '../../../3. shared/genetics';

@Component({
  selector: 'app-lose-screen',
  standalone: true,
  template: `
    <div class="lose-container">
      <div class="message">
        <h1>Out of Steps!</h1>
        <p class="lose-message">You ran out of breeding steps before reaching the goal.</p>
      </div>

      <div class="tip-box">
        <h3>Tip for Next Time</h3>
        <p>
          Think about which parent combinations give you the best chance
          of getting closer to the goal genotype <strong>{{ goalWingGenotype() }} {{ goalTailGenotype() }}</strong>.
        </p>
        <p class="hint">
          Remember: Homozygous parents (like WW × WW) always produce that same genotype in offspring!
        </p>
      </div>

      <button class="try-again-button" (click)="tryAgain.emit()">Try Again</button>
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
  `,
})
export class LoseScreenComponent {
  goalWingGenotype = input.required<WingGenotype>();
  goalTailGenotype = input.required<TailGenotype>();

  tryAgain = output();
}
