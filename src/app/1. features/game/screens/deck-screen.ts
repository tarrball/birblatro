import { Component, input, output, signal, computed } from '@angular/core';
import { BirdCardComponent } from '../components/bird-card';
import {
  BirdWithPhenotype,
  getBirdImagePath,
  Genotypes,
  Phenotypes,
  TraitConfig,
  createBird,
} from '../../../3. shared/genetics';

@Component({
  selector: 'app-deck-screen',
  standalone: true,
  imports: [BirdCardComponent],
  template: `
    <main class="deck-container" aria-label="Bird breeding deck">
      <div class="header">
        <h1>Your Birds</h1>
        <div class="breed-count" aria-live="polite">
          Breeds: <strong>{{ breedCount() }}</strong>
        </div>
      </div>

      <section class="goal-reminder" aria-label="Goal">
        <img [src]="goalImagePath()" [alt]="'Goal bird: ' + goalPhenotypesDisplay()" class="goal-image" />
        <div class="goal-text">
          <span class="goal-label">Goal:</span>
          <strong>{{ goalPhenotypesDisplay() }}</strong>
          <span class="genotype" aria-label="Genotype {{ goalGenotypesDisplay() }}">({{ goalGenotypesDisplay() }})</span>
        </div>
      </section>

      <section class="selection-info" aria-label="Parent selection">
        <div
          class="parent-slot"
          [class.filled]="selectedParent1()"
          role="status"
          aria-live="polite"
          aria-label="Parent 1 selection"
        >
          <span class="slot-label">Parent 1:</span>
          @if (selectedParent1(); as p1) {
            <span class="slot-value">{{ getParentPhenotypes(p1) }}</span>
          } @else {
            <span class="slot-empty">Select a bird</span>
          }
        </div>
        <span class="plus" aria-hidden="true">+</span>
        <div
          class="parent-slot"
          [class.filled]="selectedParent2()"
          role="status"
          aria-live="polite"
          aria-label="Parent 2 selection"
        >
          <span class="slot-label">Parent 2:</span>
          @if (selectedParent2(); as p2) {
            <span class="slot-value">{{ getParentPhenotypes(p2) }}</span>
          } @else {
            <span class="slot-empty">Select a bird</span>
          }
        </div>
      </section>

      <section aria-label="Available birds">
        <h2 class="sr-only">Available birds to select</h2>
        <div class="birds-grid" role="list">
          @for (bird of birds(); track bird.id) {
            <div role="listitem">
              <app-bird-card
                [bird]="bird"
                [traitConfigs]="traitConfigs()"
                [selected]="isSelected(bird.id)"
                [selectable]="true"
                [highlightAsOffspring]="highlightedOffspringId() === bird.id"
                [highlightAsParent]="highlightedParentIds().has(bird.id)"
                (cardClick)="onBirdClick($event)"
                (cardHover)="onBirdHover($event)"
              />
            </div>
          }
        </div>
      </section>

      <div class="actions" role="group" aria-label="Breeding actions">
        @if (selectedParent1() || selectedParent2()) {
          <button
            class="clear-button"
            (click)="clearSelection.emit()"
            aria-label="Clear parent selection"
          >
            Clear Selection
          </button>
        }
        <button
          class="breed-button"
          [disabled]="!canBreed()"
          [attr.aria-label]="canBreed() ? 'Breed selected parents to create offspring' : 'Select two parent birds to breed'"
          (click)="confirmBreeding.emit()"
        >
          Breed
        </button>
      </div>
    </main>
  `,
  styles: `
    .deck-container {
      display: flex;
      flex-direction: column;
      gap: 24px;
      padding: 24px;
      max-width: 900px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header h1 {
      font-size: 1.5rem;
      color: #1f2937;
      margin: 0;
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

    .breed-count {
      color: #6b7280;
      font-size: 0.875rem;
    }

    .goal-reminder {
      display: flex;
      align-items: center;
      gap: 16px;
      background: #fef3c7;
      border: 1px solid #f59e0b;
      border-radius: 8px;
      padding: 12px 16px;
      color: #92400e;
      font-size: 0.875rem;
    }

    .goal-image {
      width: 64px;
      height: 64px;
      object-fit: contain;
      border-radius: 8px;
      background: white;
      padding: 4px;
    }

    .goal-text {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 4px;
    }

    .goal-label {
      margin-right: 4px;
    }

    .goal-reminder .genotype {
      font-family: monospace;
      opacity: 0.7;
      margin-left: 8px;
    }

    .selection-info {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      padding: 16px;
      background: #f3f4f6;
      border-radius: 12px;
    }

    .parent-slot {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 12px 24px;
      background: white;
      border: 2px dashed #d1d5db;
      border-radius: 8px;
      min-width: 200px;
      text-align: center;
    }

    .parent-slot.filled {
      border-style: solid;
      border-color: #3b82f6;
      background: #eff6ff;
    }

    .slot-label {
      font-size: 0.75rem;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .slot-value {
      font-weight: 600;
      color: #1f2937;
    }

    .slot-empty {
      color: #9ca3af;
      font-style: italic;
    }

    .plus {
      font-size: 1.5rem;
      color: #9ca3af;
      font-weight: 300;
    }

    .birds-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 16px;
    }

    .actions {
      display: flex;
      justify-content: center;
      gap: 16px;
      padding-top: 16px;
    }

    .clear-button {
      background: #f3f4f6;
      color: #4b5563;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      padding: 12px 24px;
      font-size: 1rem;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .clear-button:hover {
      background: #e5e7eb;
    }

    .breed-button {
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 12px 48px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .breed-button:hover:not(:disabled) {
      background: #2563eb;
    }

    .breed-button:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }
  `,
})
export class DeckScreenComponent {
  birds = input.required<BirdWithPhenotype[]>();
  selectedParent1 = input<BirdWithPhenotype | null>(null);
  selectedParent2 = input<BirdWithPhenotype | null>(null);
  breedCount = input.required<number>();
  goalGenotypes = input.required<Genotypes>();
  goalPhenotypes = input.required<Phenotypes>();
  traitConfigs = input.required<TraitConfig[]>();
  canBreed = input.required<boolean>();

  goalImagePath = computed(() => {
    const goalBird = createBird('goal', this.goalGenotypes());
    return getBirdImagePath(goalBird, this.traitConfigs());
  });

  goalGenotypesDisplay = computed(() =>
    this.traitConfigs()
      .map((config) => this.goalGenotypes()[config.id])
      .join(' ')
  );

  goalPhenotypesDisplay = computed(() =>
    this.traitConfigs()
      .map((config) => this.goalPhenotypes()[config.id])
      .join(' + ')
  );

  selectParent1 = output<string>();
  selectParent2 = output<string>();
  clearSelection = output();
  confirmBreeding = output();

  hoveredBirdId = signal<string | null>(null);

  private hoveredBird = computed(() => {
    const hoveredId = this.hoveredBirdId();
    if (!hoveredId) return null;
    return this.birds().find((p) => p.id === hoveredId) || null;
  });

  highlightedOffspringId = computed(() => {
    const hoveredId = this.hoveredBirdId();
    if (!hoveredId) return null;
    const bird = this.birds().find((p) => p.id === hoveredId);
    if (bird?.parentId1 && bird?.parentId2) {
      return hoveredId;
    }
    return null;
  });

  highlightedParentIds = computed(() => {
    const hovered = this.hoveredBird();
    if (!hovered || !hovered.parentId1 || !hovered.parentId2) {
      return new Set<string>();
    }
    return new Set([hovered.parentId1, hovered.parentId2]);
  });

  getParentPhenotypes(parent: BirdWithPhenotype): string {
    return this.traitConfigs()
      .map((config) => parent.phenotypes[config.id])
      .join(', ');
  }

  isSelected(birdId: string): boolean {
    return this.selectedParent1()?.id === birdId || this.selectedParent2()?.id === birdId;
  }

  onBirdClick(birdId: string) {
    if (this.selectedParent1()?.id === birdId || this.selectedParent2()?.id === birdId) {
      return;
    }

    if (!this.selectedParent1()) {
      this.selectParent1.emit(birdId);
    } else if (!this.selectedParent2()) {
      this.selectParent2.emit(birdId);
    }
  }

  onBirdHover(birdId: string | null) {
    this.hoveredBirdId.set(birdId);
  }
}
