import { Component, output } from '@angular/core';

@Component({
  selector: 'app-intro-screen',
  standalone: true,
  template: `
    <div class="intro-container">
      <h1 class="title">Untitled Bird-breeding Game</h1>
      <p class="subtitle">Learn genetics by breeding birds!</p>

      <div class="button-group">
        <button class="tutorial-button" (click)="showTutorial.emit()">How to Play</button>
        <button class="start-button" (click)="startGame.emit()">Start Game</button>
      </div>
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

    .button-group {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 24px;
    }

    .tutorial-button {
      background: #f3f4f6;
      color: #374151;
      border: 2px solid #d1d5db;
      border-radius: 8px;
      padding: 16px 48px;
      font-size: 1.125rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .tutorial-button:hover {
      background: #e5e7eb;
      border-color: #9ca3af;
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
  showTutorial = output();
}
