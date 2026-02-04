import { Component, output } from '@angular/core';

@Component({
  selector: 'app-tutorial-screen',
  standalone: true,
  template: `
    <div class="tutorial-container">
      <h1 class="title">How to Play</h1>

      <div class="instructions">
        <h2>Game Steps</h2>
        <ol>
          <li>Select two parent birds from your collection</li>
          <li>View the <strong>Punnett squares</strong> to predict offspring traits</li>
          <li>Breed to create a new bird</li>
          <li>Reach the goal bird to win!</li>
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
        <p>Breed a bird that matches the <strong>target genotype</strong></p>
        <p class="genotype-hint">A random goal will be assigned when you start!</p>
      </div>

      <div class="button-group">
        <button class="back-button" (click)="backToIntro.emit()">Back</button>
        <button class="start-button" (click)="startGame.emit()">Start Game</button>
      </div>
    </div>
  `,
  styles: `
    .tutorial-container {
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
      font-size: 2.5rem;
      font-weight: 700;
      color: #1f2937;
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

    .button-group {
      display: flex;
      gap: 12px;
      margin-top: 12px;
    }

    .back-button {
      background: #f3f4f6;
      color: #374151;
      border: 2px solid #d1d5db;
      border-radius: 8px;
      padding: 16px 32px;
      font-size: 1.125rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .back-button:hover {
      background: #e5e7eb;
      border-color: #9ca3af;
    }

    .start-button {
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 16px 32px;
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
export class TutorialScreenComponent {
  startGame = output();
  backToIntro = output();
}
