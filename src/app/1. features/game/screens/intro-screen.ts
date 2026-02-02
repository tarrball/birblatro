import { Component, output } from '@angular/core';

@Component({
  selector: 'app-intro-screen',
  standalone: true,
  template: `
    <div class="intro-container">
      <h1 class="title">Pigeon Punnett</h1>
      <p class="subtitle">Learn genetics by breeding pigeons!</p>

      <div class="instructions">
        <h2>How to Play</h2>
        <ol>
          <li>Select two parent pigeons from your collection</li>
          <li>View the <strong>Punnett squares</strong> to predict offspring traits</li>
          <li>Breed to create a new pigeon</li>
          <li>Reach the goal pigeon to win!</li>
        </ol>

        <div class="vocabulary">
          <h3>Key Terms</h3>
          <dl>
            <dt>Allele</dt>
            <dd>A version of a gene (like W or w for wing size)</dd>
            <dt>Genotype</dt>
            <dd>The combination of alleles (like Ww)</dd>
            <dt>Phenotype</dt>
            <dd>The visible trait (like "Medium wings")</dd>
          </dl>
        </div>
      </div>

      <div class="goal-info">
        <h3>Your Goal</h3>
        <p>Breed a pigeon that matches the <strong>target genotype</strong></p>
        <p class="genotype-hint">A random goal will be assigned when you start!</p>
      </div>

      <button class="start-button" (click)="startGame.emit()">Start Game</button>
    </div>
  `,
  styles: `
    .intro-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 24px;
      padding: 48px 24px;
      max-width: 600px;
      margin: 0 auto;
      text-align: center;
    }

    .title {
      font-size: 3rem;
      font-weight: 700;
      color: #1f2937;
      margin: 0;
    }

    .subtitle {
      font-size: 1.25rem;
      color: #6b7280;
      margin: 0;
    }

    .instructions {
      background: #f9fafb;
      border-radius: 12px;
      padding: 24px;
      width: 100%;
      text-align: left;
    }

    .instructions h2 {
      font-size: 1.25rem;
      color: #374151;
      margin: 0 0 16px 0;
    }

    .instructions ol {
      margin: 0;
      padding-left: 24px;
      color: #4b5563;
    }

    .instructions li {
      margin-bottom: 8px;
    }

    .vocabulary {
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid #e5e7eb;
    }

    .vocabulary h3 {
      font-size: 1rem;
      color: #374151;
      margin: 0 0 12px 0;
    }

    .vocabulary dl {
      margin: 0;
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 8px 16px;
    }

    .vocabulary dt {
      font-weight: 600;
      color: #1f2937;
    }

    .vocabulary dd {
      margin: 0;
      color: #6b7280;
    }

    .goal-info {
      background: #dbeafe;
      border: 2px solid #3b82f6;
      border-radius: 12px;
      padding: 20px;
      width: 100%;
    }

    .goal-info h3 {
      font-size: 1.125rem;
      color: #1e40af;
      margin: 0 0 8px 0;
    }

    .goal-info p {
      color: #1e40af;
      margin: 4px 0;
    }

    .genotype-hint {
      font-family: monospace;
      font-size: 0.875rem;
      opacity: 0.8;
    }

    .start-button {
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

    .start-button:hover {
      background: #2563eb;
    }
  `,
})
export class IntroScreenComponent {
  startGame = output();
}
