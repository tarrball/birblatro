import { Component } from '@angular/core';

@Component({
  selector: 'app-starting-screen',
  standalone: true,
  template: `
    <div class="starting-container">
      <div class="spinner"></div>
      <h2>Creating your game...</h2>
    </div>
  `,
  styles: `
    .starting-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 24px;
      min-height: 100vh;
      padding: 48px 24px;
    }

    .spinner {
      width: 64px;
      height: 64px;
      border: 4px solid #e5e7eb;
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    h2 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #1f2937;
      margin: 0;
    }
  `,
})
export class StartingScreenComponent {}
