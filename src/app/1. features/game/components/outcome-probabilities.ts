import { Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { BreedingOutcome, getWingPhenotype, getTailPhenotype } from '../../../3. shared/genetics';

@Component({
  selector: 'app-outcome-probabilities',
  standalone: true,
  imports: [DecimalPipe],
  template: `
    <div class="probabilities-container">
      <div class="probabilities-title">Possible Outcomes</div>
      <div class="outcomes-list">
        @for (outcome of sortedOutcomes(); track $index) {
          <div class="outcome-row" [class.highlight]="outcome.probability >= 0.25">
            <div class="outcome-genotype">
              <span class="genotype">{{ outcome.wingGenotype }} {{ outcome.tailGenotype }}</span>
            </div>
            <div class="outcome-phenotype">
              {{ getWingPhenotype(outcome.wingGenotype) }}, {{ getTailPhenotype(outcome.tailGenotype) }}
            </div>
            <div class="outcome-probability">
              {{ outcome.probability * 100 | number: '1.0-0' }}%
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: `
    .probabilities-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .probabilities-title {
      font-weight: 600;
      color: #374151;
      font-size: 1rem;
    }

    .outcomes-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .outcome-row {
      display: grid;
      grid-template-columns: 80px 1fr 60px;
      gap: 12px;
      padding: 8px 12px;
      background: #f9fafb;
      border-radius: 8px;
      align-items: center;
      font-size: 0.875rem;
    }

    .outcome-row.highlight {
      background: #dbeafe;
      border: 1px solid #93c5fd;
    }

    .outcome-genotype {
      font-family: monospace;
      font-weight: 600;
      color: #1f2937;
    }

    .outcome-phenotype {
      color: #4b5563;
    }

    .outcome-probability {
      text-align: right;
      font-weight: 600;
      color: #059669;
    }
  `,
})
export class OutcomeProbabilitiesComponent {
  outcomes = input.required<BreedingOutcome[]>();

  getWingPhenotype = getWingPhenotype;
  getTailPhenotype = getTailPhenotype;

  sortedOutcomes() {
    return [...this.outcomes()].sort((a, b) => b.probability - a.probability).slice(0, 6);
  }
}
