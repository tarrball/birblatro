import { Component, input, output, computed } from '@angular/core';
import { BirdCardComponent } from '../components/bird-card';
import { PunnettSquareComponent } from '../components/punnett-square';
import { OutcomeProbabilitiesComponent } from '../components/outcome-probabilities';
import { BreedingResult } from '../../../2. store/game';
import { BirdWithPhenotype, TraitConfig } from '../../../3. shared/genetics';

@Component({
  selector: 'app-result-screen',
  standalone: true,
  imports: [BirdCardComponent, PunnettSquareComponent, OutcomeProbabilitiesComponent],
  template: `
    <div class="result-container">
      <h2>Breeding Result</h2>

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

      <div class="punnett-section">
        <h3>Punnett Squares</h3>
        <div class="squares">
          @for (square of breedingResult().squares; track square.traitId) {
            <app-punnett-square [square]="square" [title]="getSquareTitle(square.traitId)" />
          }
        </div>
      </div>

      <div class="probabilities-section">
        <app-outcome-probabilities
          [outcomes]="breedingResult().outcomes"
          [traitConfigs]="traitConfigs()"
        />
      </div>

      <div class="offspring-section">
        <h3>Offspring</h3>
        <p class="offspring-explanation">
          Based on the Punnett squares, these offspring were produced:
        </p>
        <div class="offspring-grid">
          @for (child of offspring(); track child.id) {
            <app-bird-card [bird]="child" [traitConfigs]="traitConfigs()" />
          }
        </div>
      </div>

      <button class="continue-button" (click)="continueGame.emit()">Continue</button>
    </div>
  `,
  styles: `
    .result-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 32px;
      padding: 24px;
      max-width: 800px;
      margin: 0 auto;
    }

    h2 {
      font-size: 1.75rem;
      color: #1f2937;
      margin: 0;
    }

    h3 {
      font-size: 1.25rem;
      color: #374151;
      margin: 0 0 16px 0;
    }

    .parents-section {
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .parent {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .parent-label {
      font-size: 0.875rem;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .cross-symbol {
      font-size: 2rem;
      color: #9ca3af;
      font-weight: 300;
    }

    .punnett-section {
      background: #f9fafb;
      border-radius: 12px;
      padding: 24px;
      width: 100%;
      text-align: center;
    }

    .squares {
      display: flex;
      justify-content: center;
      gap: 48px;
      flex-wrap: wrap;
    }

    .probabilities-section {
      width: 100%;
      max-width: 500px;
    }

    .offspring-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      background: #ecfdf5;
      border: 2px solid #10b981;
      border-radius: 12px;
      padding: 24px;
      width: 100%;
    }

    .offspring-section h3 {
      color: #065f46;
      margin: 0;
    }

    .offspring-explanation {
      color: #047857;
      margin: 0;
      font-size: 0.875rem;
    }

    .offspring-grid {
      display: flex;
      gap: 24px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .continue-button {
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

    .continue-button:hover {
      background: #2563eb;
    }
  `,
})
export class ResultScreenComponent {
  breedingResult = input.required<BreedingResult>();
  parent1 = input.required<BirdWithPhenotype | null>();
  parent2 = input.required<BirdWithPhenotype | null>();
  offspring = input.required<BirdWithPhenotype[]>();
  traitConfigs = input.required<TraitConfig[]>();

  continueGame = output();

  private traitConfigMap = computed(() => {
    const map = new Map<string, TraitConfig>();
    for (const config of this.traitConfigs()) {
      map.set(config.id, config);
    }
    return map;
  });

  getSquareTitle(traitId: string): string {
    const config = this.traitConfigMap().get(traitId);
    if (!config) return traitId;
    return `${config.displayName} (${config.alleles.dominant}/${config.alleles.recessive})`;
  }
}
