import { Component, input, computed } from '@angular/core';
import { PunnettSquare } from '../../../3. shared/genetics';

let punnettIdCounter = 0;

@Component({
  selector: 'app-punnett-square',
  standalone: true,
  template: `
    <figure class="punnett-container">
      <figcaption class="punnett-title" [id]="titleId()">{{ title() }}</figcaption>
      <table class="punnett-table" [attr.aria-labelledby]="titleId()" aria-describedby="punnett-description">
        <caption class="sr-only">
          Punnett Square showing possible offspring genotypes.
          Parent 1 alleles are in rows, Parent 2 alleles are in columns.
          Each cell shows a possible offspring genotype with 25% probability.
        </caption>
        <thead>
          <tr>
            <th scope="col" class="corner">
              <span class="sr-only">Parent 1 / Parent 2</span>
            </th>
            <th scope="col" class="header">{{ square().parent2Alleles[0] }}</th>
            <th scope="col" class="header">{{ square().parent2Alleles[1] }}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row" class="header">{{ square().parent1Alleles[0] }}</th>
            <td class="outcome">{{ square().grid[0] }}</td>
            <td class="outcome">{{ square().grid[1] }}</td>
          </tr>
          <tr>
            <th scope="row" class="header">{{ square().parent1Alleles[1] }}</th>
            <td class="outcome">{{ square().grid[2] }}</td>
            <td class="outcome">{{ square().grid[3] }}</td>
          </tr>
        </tbody>
      </table>
    </figure>
  `,
  styles: `
    .punnett-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      margin: 0;
    }

    .punnett-title {
      font-weight: 600;
      color: #374151;
      font-size: 0.875rem;
    }

    .punnett-table {
      border-collapse: separate;
      border-spacing: 2px;
    }

    .punnett-table th,
    .punnett-table td {
      width: 48px;
      height: 48px;
      text-align: center;
      vertical-align: middle;
      font-family: monospace;
      font-size: 1rem;
    }

    .corner {
      background: transparent;
    }

    .header {
      background: #e5e7eb;
      font-weight: 700;
      color: #374151;
      border-radius: 4px;
    }

    .outcome {
      background: #dbeafe;
      color: #1e40af;
      border-radius: 4px;
      font-weight: 500;
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
  `,
})
export class PunnettSquareComponent {
  square = input.required<PunnettSquare>();
  title = input<string>('');

  private instanceId = ++punnettIdCounter;
  titleId = computed(() => `punnett-title-${this.instanceId}`);
}
