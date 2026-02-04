import { Component, input, output, computed } from '@angular/core';
import { BirdWithPhenotype, getBirdImagePath, TraitConfig } from '../../../3. shared/genetics';

@Component({
  selector: 'app-bird-card',
  standalone: true,
  template: `
    <div
      class="bird-card"
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
        class="bird-image"
        (error)="onImageError($event)"
      />
      <div class="bird-info">
        <div class="phenotype" title="Phenotype: The observable physical traits">
          @for (traitConfig of traitConfigs(); track traitConfig.id) {
            <span>{{ bird().phenotypes[traitConfig.id] }}</span>
          }
        </div>
        <div class="genotype" title="Genotype: The genetic makeup (allele pairs)">
          <span class="genotype-label">Genotype:</span>
          <span class="genotype-value" title="Each letter represents an allele. Uppercase = dominant, lowercase = recessive">{{ genotypeDisplay() }}</span>
        </div>
      </div>
    </div>
  `,
  styles: `
    .bird-card {
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      padding: 16px;
      background: white;
      text-align: center;
      transition: all 0.2s ease;
      cursor: default;
    }

    .bird-card.selectable {
      cursor: pointer;
    }

    .bird-card.selectable:hover {
      border-color: #3b82f6;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
    }

    .bird-card.selected {
      border-color: #3b82f6;
      background: #eff6ff;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
    }

    .bird-card.highlight-offspring,
    .bird-card.selectable.highlight-offspring:hover {
      border-color: #8b5cf6;
      background: #f5f3ff;
      box-shadow: 0 4px 12px rgba(139, 92, 246, 0.25);
    }

    .bird-card.highlight-parent,
    .bird-card.selectable.highlight-parent:hover {
      border-color: #f59e0b;
      background: #fffbeb;
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.25);
    }

    .bird-image {
      width: 150px;
      height: 150px;
      object-fit: contain;
      margin: 0 auto 12px;
      display: block;
    }

    .bird-info {
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
export class BirdCardComponent {
  bird = input.required<BirdWithPhenotype>();
  traitConfigs = input.required<TraitConfig[]>();
  selected = input<boolean>(false);
  selectable = input<boolean>(false);
  highlightAsOffspring = input<boolean>(false);
  highlightAsParent = input<boolean>(false);

  cardClick = output<string>();
  cardHover = output<string | null>();

  imagePath = computed(() => getBirdImagePath(this.bird(), this.traitConfigs()));

  genotypeDisplay = computed(() =>
    this.traitConfigs()
      .map((config) => this.bird().genotypes[config.id])
      .join(' ')
  );

  altText = computed(() => {
    const phenotypes = this.traitConfigs()
      .map((config) => this.bird().phenotypes[config.id])
      .join(', ');
    return `${phenotypes} bird`;
  });

  handleClick() {
    if (this.selectable()) {
      this.cardClick.emit(this.bird().id);
    }
  }

  handleMouseEnter() {
    this.cardHover.emit(this.bird().id);
  }

  handleMouseLeave() {
    this.cardHover.emit(null);
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'birds/placeholder.svg';
  }
}
