import { Component, input, output } from '@angular/core';
import { PigeonWithPhenotype, getPigeonImagePath } from '../../../3. shared/genetics';

@Component({
  selector: 'app-pigeon-card',
  standalone: true,
  template: `
    <div
      class="pigeon-card"
      [class.selected]="selected()"
      [class.selectable]="selectable()"
      [class.highlight-offspring]="highlightAsOffspring()"
      [class.highlight-parent]="highlightAsParent()"
      (click)="handleClick()"
      (mouseenter)="handleMouseEnter()"
      (mouseleave)="handleMouseLeave()"
    >
      <img
        [src]="imagePath()"
        [alt]="altText()"
        class="pigeon-image"
        (error)="onImageError($event)"
      />
      <div class="pigeon-info">
        <div class="phenotype" title="Phenotype: The observable physical traits">
          <span>{{ pigeon().wingPhenotype }}</span>
          <span>{{ pigeon().tailPhenotype }}</span>
        </div>
        <div class="genotype" title="Genotype: The genetic makeup (allele pairs)">
          <span class="genotype-label">Genotype:</span>
          <span class="genotype-value" title="Each letter represents an allele. Uppercase = dominant, lowercase = recessive">{{ pigeon().wingGenotype }} {{ pigeon().tailGenotype }}</span>
        </div>
      </div>
    </div>
  `,
  styles: `
    .pigeon-card {
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      padding: 16px;
      background: white;
      text-align: center;
      transition: all 0.2s ease;
      cursor: default;
    }

    .pigeon-card.selectable {
      cursor: pointer;
    }

    .pigeon-card.selectable:hover {
      border-color: #3b82f6;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
    }

    .pigeon-card.selected {
      border-color: #3b82f6;
      background: #eff6ff;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
    }

    .pigeon-card.highlight-offspring,
    .pigeon-card.selectable.highlight-offspring:hover {
      border-color: #8b5cf6;
      background: #f5f3ff;
      box-shadow: 0 4px 12px rgba(139, 92, 246, 0.25);
    }

    .pigeon-card.highlight-parent,
    .pigeon-card.selectable.highlight-parent:hover {
      border-color: #f59e0b;
      background: #fffbeb;
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.25);
    }

    .pigeon-image {
      width: 150px;
      height: 150px;
      object-fit: contain;
      margin: 0 auto 12px;
      display: block;
    }

    .pigeon-info {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .phenotype {
      display: flex;
      flex-direction: column;
      font-weight: 600;
      color: #1f2937;
    }

    .genotype {
      font-size: 0.875rem;
      color: #6b7280;
    }

    .genotype-label {
      font-style: italic;
    }

    .genotype-value {
      font-family: monospace;
      margin-left: 4px;
    }
  `,
})
export class PigeonCardComponent {
  pigeon = input.required<PigeonWithPhenotype>();
  selected = input<boolean>(false);
  selectable = input<boolean>(false);
  highlightAsOffspring = input<boolean>(false);
  highlightAsParent = input<boolean>(false);

  cardClick = output<string>();
  cardHover = output<string | null>();

  imagePath() {
    return getPigeonImagePath(this.pigeon());
  }

  altText() {
    return `${this.pigeon().wingPhenotype}, ${this.pigeon().tailPhenotype} pigeon`;
  }

  handleClick() {
    if (this.selectable()) {
      this.cardClick.emit(this.pigeon().id);
    }
  }

  handleMouseEnter() {
    this.cardHover.emit(this.pigeon().id);
  }

  handleMouseLeave() {
    this.cardHover.emit(null);
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'pigeons/placeholder.svg';
  }
}
