import { Component, input, output, computed } from '@angular/core';
import { BirdCarouselComponent } from '../components/bird-carousel';
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
  selector: 'app-challenge-deck-screen',
  standalone: true,
  imports: [BirdCarouselComponent, BirdCardComponent],
  template: `
    <main class="challenge-container" aria-label="Challenge mode deck">
      <!-- Header with challenge stats -->
      <header class="challenge-header">
        <div class="stat">
          <span class="stat-label">Round</span>
          <span class="stat-value">{{ challengeRound() }}</span>
        </div>
        <div class="stat score">
          <span class="stat-label">Score</span>
          <span class="stat-value">{{ challengeScore() }}</span>
        </div>
        <div class="stat breeds">
          <span class="stat-label">Breeds Left</span>
          <div class="breeds-dots">
            @for (i of [1, 2, 3, 4]; track i) {
              <span
                class="breed-dot"
                [class.active]="i <= breedsRemaining()"
                [attr.aria-label]="i <= breedsRemaining() ? 'Breed available' : 'Breed used'"
              ></span>
            }
          </div>
        </div>
      </header>

      <!-- Compact goal display -->
      <section class="goal-section" aria-label="Goal">
        <img [src]="goalImagePath()" [alt]="'Goal bird'" class="goal-image" />
        <div class="goal-info">
          <span class="goal-label">Target:</span>
          <strong class="goal-phenotypes">{{ goalPhenotypesDisplay() }}</strong>
          <span class="goal-genotypes">({{ goalGenotypesDisplay() }})</span>
        </div>
      </section>

      <!-- Parent selection slots - vertical on mobile -->
      <section class="parents-section" aria-label="Selected parents">
        <div class="parent-slot" [class.filled]="selectedParent1()">
          <span class="slot-label">Parent 1</span>
          @if (selectedParent1(); as p1) {
            <div class="mini-bird">
              <app-bird-card
                [bird]="p1"
                [traitConfigs]="traitConfigs()"
                [selected]="true"
              />
            </div>
          } @else {
            <div class="slot-empty">
              <span>Swipe & tap to select</span>
            </div>
          }
        </div>

        <span class="plus-icon" aria-hidden="true">+</span>

        <div class="parent-slot" [class.filled]="selectedParent2()">
          <span class="slot-label">Parent 2</span>
          @if (selectedParent2(); as p2) {
            <div class="mini-bird">
              <app-bird-card
                [bird]="p2"
                [traitConfigs]="traitConfigs()"
                [selected]="true"
              />
            </div>
          } @else {
            <div class="slot-empty">
              <span>Swipe & tap to select</span>
            </div>
          }
        </div>
      </section>

      <!-- Bird carousel -->
      <section class="carousel-section" aria-label="Available birds">
        <app-bird-carousel
          [birds]="birds()"
          [traitConfigs]="traitConfigs()"
          [selectedBirdIds]="selectedBirdIdSet()"
          (selectBird)="onSelectBird($event)"
        />
      </section>

      <!-- Action buttons -->
      <div class="actions">
        @if (selectedParent1() || selectedParent2()) {
          <button
            class="clear-button"
            (click)="clearSelection.emit()"
            aria-label="Clear parent selection"
          >
            Clear
          </button>
        }
        <button
          class="breed-button"
          [disabled]="!canBreed()"
          [attr.aria-label]="canBreed() ? 'Breed selected parents' : 'Select two parents to breed'"
          (click)="confirmBreeding.emit()"
        >
          Breed
        </button>
      </div>
    </main>
  `,
  styles: `
    .challenge-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px;
      max-width: 500px;
      margin: 0 auto;
      min-height: 100vh;
    }

    /* Header */
    .challenge-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: #1f2937;
      border-radius: 12px;
      color: white;
    }

    .stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }

    .stat-label {
      font-size: 0.625rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      opacity: 0.7;
    }

    .stat-value {
      font-size: 1.25rem;
      font-weight: 700;
    }

    .stat.score .stat-value {
      color: #fbbf24;
    }

    .breeds-dots {
      display: flex;
      gap: 6px;
    }

    .breed-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #4b5563;
      transition: all 0.2s ease;
    }

    .breed-dot.active {
      background: #10b981;
      box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
    }

    /* Goal section */
    .goal-section {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #fef3c7;
      border: 1px solid #f59e0b;
      border-radius: 8px;
    }

    .goal-image {
      width: 48px;
      height: 48px;
      object-fit: contain;
      background: white;
      border-radius: 6px;
      padding: 4px;
    }

    .goal-info {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 4px;
      font-size: 0.875rem;
      color: #92400e;
    }

    .goal-label {
      font-weight: 500;
    }

    .goal-phenotypes {
      color: #78350f;
    }

    .goal-genotypes {
      font-family: monospace;
      font-size: 0.75rem;
      opacity: 0.7;
    }

    /* Parents section */
    .parents-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 12px;
      background: #f3f4f6;
      border-radius: 12px;
    }

    .parent-slot {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      width: 100%;
      max-width: 200px;
    }

    .slot-label {
      font-size: 0.625rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #6b7280;
    }

    .mini-bird {
      transform: scale(0.7);
      transform-origin: top center;
      margin-bottom: -40px;
    }

    .slot-empty {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px 24px;
      background: white;
      border: 2px dashed #d1d5db;
      border-radius: 8px;
      color: #9ca3af;
      font-size: 0.875rem;
      width: 100%;
    }

    .plus-icon {
      font-size: 1.5rem;
      color: #9ca3af;
      font-weight: 300;
    }

    /* Carousel section */
    .carousel-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    /* Actions */
    .actions {
      display: flex;
      justify-content: center;
      gap: 12px;
      padding: 16px 0;
      position: sticky;
      bottom: 0;
      background: linear-gradient(transparent, #f9fafb 20%);
    }

    .clear-button {
      background: #f3f4f6;
      color: #4b5563;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      padding: 16px 24px;
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
      padding: 16px 48px;
      font-size: 1.125rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      flex: 1;
      max-width: 200px;
    }

    .breed-button:hover:not(:disabled) {
      background: #2563eb;
      transform: scale(1.02);
    }

    .breed-button:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }

    /* Desktop layout */
    @media (min-width: 768px) {
      .challenge-container {
        max-width: 700px;
        padding: 24px;
      }

      .parents-section {
        flex-direction: row;
        justify-content: center;
        gap: 24px;
      }

      .parent-slot {
        max-width: 180px;
      }

      .plus-icon {
        font-size: 2rem;
      }
    }
  `,
})
export class ChallengeDeckScreenComponent {
  birds = input.required<BirdWithPhenotype[]>();
  selectedParent1 = input<BirdWithPhenotype | null>(null);
  selectedParent2 = input<BirdWithPhenotype | null>(null);
  goalGenotypes = input.required<Genotypes>();
  goalPhenotypes = input.required<Phenotypes>();
  traitConfigs = input.required<TraitConfig[]>();
  canBreed = input.required<boolean>();
  challengeRound = input.required<number>();
  challengeScore = input.required<number>();
  breedsRemaining = input.required<number>();

  selectParent1 = output<string>();
  selectParent2 = output<string>();
  clearSelection = output();
  confirmBreeding = output();

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

  selectedBirdIdSet = computed(() => {
    const ids = new Set<string>();
    const p1 = this.selectedParent1();
    const p2 = this.selectedParent2();
    if (p1) ids.add(p1.id);
    if (p2) ids.add(p2.id);
    return ids;
  });

  onSelectBird(birdId: string) {
    // Don't select if already selected
    if (this.selectedBirdIdSet().has(birdId)) {
      return;
    }

    // Fill first empty slot
    if (!this.selectedParent1()) {
      this.selectParent1.emit(birdId);
    } else if (!this.selectedParent2()) {
      this.selectParent2.emit(birdId);
    }
  }
}
