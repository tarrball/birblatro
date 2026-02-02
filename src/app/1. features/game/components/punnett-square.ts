import { Component, input } from '@angular/core';
import { PunnettSquare } from '../../../3. shared/genetics';

@Component({
  selector: 'app-punnett-square',
  standalone: true,
  template: `
    <div class="punnett-container" title="Punnett Square: A diagram showing all possible offspring genotypes from two parents">
      <div class="punnett-title">{{ title() }}</div>
      <div class="punnett-grid">
        <!-- Empty corner -->
        <div class="cell corner"></div>
        <!-- Parent 2 alleles (column headers) -->
        <div class="cell header" title="Allele from Parent 2">{{ square().parent2Alleles[0] }}</div>
        <div class="cell header" title="Allele from Parent 2">{{ square().parent2Alleles[1] }}</div>

        <!-- Row 1 -->
        <div class="cell header" title="Allele from Parent 1">{{ square().parent1Alleles[0] }}</div>
        <div class="cell outcome" title="Possible offspring genotype (25% chance)">{{ square().grid[0] }}</div>
        <div class="cell outcome" title="Possible offspring genotype (25% chance)">{{ square().grid[1] }}</div>

        <!-- Row 2 -->
        <div class="cell header" title="Allele from Parent 1">{{ square().parent1Alleles[1] }}</div>
        <div class="cell outcome" title="Possible offspring genotype (25% chance)">{{ square().grid[2] }}</div>
        <div class="cell outcome" title="Possible offspring genotype (25% chance)">{{ square().grid[3] }}</div>
      </div>
    </div>
  `,
  styles: `
    .punnett-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .punnett-title {
      font-weight: 600;
      color: #374151;
      font-size: 0.875rem;
    }

    .punnett-grid {
      display: grid;
      grid-template-columns: repeat(3, 48px);
      grid-template-rows: repeat(3, 48px);
      gap: 2px;
    }

    .cell {
      display: flex;
      align-items: center;
      justify-content: center;
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
  `,
})
export class PunnettSquareComponent {
  square = input.required<PunnettSquare>();
  title = input<string>('');
}
