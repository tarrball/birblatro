import { Component, input, computed } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { BreedingOutcome, TraitConfig, getPhenotype } from '../../../3. shared/genetics';

@Component({
  selector: 'app-outcome-probabilities',
  standalone: true,
  imports: [DecimalPipe],
  template: `
    <div class="probabilities-container">
      <table class="outcomes-table" aria-label="Possible breeding outcomes with probabilities">
        <caption class="probabilities-title">Possible Outcomes</caption>
        <thead>
          <tr>
            <th scope="col">Genotype</th>
            <th scope="col">Phenotype</th>
            <th scope="col">Probability</th>
          </tr>
        </thead>
        <tbody>
          @for (outcome of sortedOutcomes(); track $index) {
            <tr [class.highlight]="outcome.probability >= 0.25">
              <td class="outcome-genotype">{{ getGenotypeDisplay(outcome) }}</td>
              <td class="outcome-phenotype">{{ getPhenotypeDisplay(outcome) }}</td>
              <td class="outcome-probability">{{ outcome.probability * 100 | number: '1.0-0' }}%</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: `
    .probabilities-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .outcomes-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0 8px;
      font-size: 0.875rem;
    }

    .probabilities-title {
      font-weight: 600;
      color: #374151;
      font-size: 1rem;
      text-align: left;
      padding-bottom: 8px;
    }

    .outcomes-table thead th {
      text-align: left;
      font-weight: 600;
      color: #6b7280;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 0 12px 8px;
    }

    .outcomes-table thead th:last-child {
      text-align: right;
    }

    .outcomes-table tbody tr {
      background: #f9fafb;
    }

    .outcomes-table tbody tr.highlight {
      background: #dbeafe;
    }

    .outcomes-table tbody td {
      padding: 8px 12px;
    }

    .outcomes-table tbody tr td:first-child {
      border-radius: 8px 0 0 8px;
    }

    .outcomes-table tbody tr td:last-child {
      border-radius: 0 8px 8px 0;
    }

    .outcomes-table tbody tr.highlight td {
      border-top: 1px solid #93c5fd;
      border-bottom: 1px solid #93c5fd;
    }

    .outcomes-table tbody tr.highlight td:first-child {
      border-left: 1px solid #93c5fd;
    }

    .outcomes-table tbody tr.highlight td:last-child {
      border-right: 1px solid #93c5fd;
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
  traitConfigs = input.required<TraitConfig[]>();

  sortedOutcomes = computed(() =>
    [...this.outcomes()].sort((a, b) => b.probability - a.probability).slice(0, 6)
  );

  getGenotypeDisplay(outcome: BreedingOutcome): string {
    return this.traitConfigs()
      .map((config) => outcome.genotypes[config.id])
      .join(' ');
  }

  getPhenotypeDisplay(outcome: BreedingOutcome): string {
    return this.traitConfigs()
      .map((config) => getPhenotype(config, outcome.genotypes[config.id]))
      .join(', ');
  }
}
