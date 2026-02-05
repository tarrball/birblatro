import { Component, input, output, signal, computed, HostListener } from '@angular/core';
import { BirdCardComponent } from './bird-card';
import { BirdWithPhenotype, TraitConfig } from '../../../3. shared/genetics';

@Component({
  selector: 'app-bird-carousel',
  standalone: true,
  imports: [BirdCardComponent],
  template: `
    <div
      class="carousel-container"
      (touchstart)="onTouchStart($event)"
      (touchmove)="onTouchMove($event)"
      (touchend)="onTouchEnd()"
    >
      <button
        class="nav-button nav-prev"
        (click)="navigate(-1)"
        [disabled]="birds().length <= 1"
        aria-label="Previous bird"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      <div class="carousel-track">
        @if (prevBird(); as bird) {
          <div class="carousel-item prev" (click)="navigate(-1)">
            <app-bird-card
              [bird]="bird"
              [traitConfigs]="traitConfigs()"
              [selectable]="false"
            />
          </div>
        }

        @if (currentBird(); as bird) {
          <div
            class="carousel-item current"
            [class.selected]="isCurrentSelected()"
            (click)="onSelectCurrent()"
          >
            <app-bird-card
              [bird]="bird"
              [traitConfigs]="traitConfigs()"
              [selected]="isCurrentSelected()"
              [selectable]="true"
            />
            <div class="select-hint" [class.hidden]="isCurrentSelected()">
              Tap to select
            </div>
          </div>
        }

        @if (nextBird(); as bird) {
          <div class="carousel-item next" (click)="navigate(1)">
            <app-bird-card
              [bird]="bird"
              [traitConfigs]="traitConfigs()"
              [selectable]="false"
            />
          </div>
        }
      </div>

      <button
        class="nav-button nav-next"
        (click)="navigate(1)"
        [disabled]="birds().length <= 1"
        aria-label="Next bird"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>

    <div class="carousel-dots" role="tablist" aria-label="Bird carousel navigation">
      @for (bird of birds(); track bird.id; let i = $index) {
        <button
          class="dot"
          [class.active]="i === currentIndex()"
          (click)="goToIndex(i)"
          role="tab"
          [attr.aria-selected]="i === currentIndex()"
          [attr.aria-label]="'Go to bird ' + (i + 1)"
        ></button>
      }
    </div>
  `,
  styles: `
    .carousel-container {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 16px 0;
      touch-action: pan-y;
      user-select: none;
    }

    .nav-button {
      flex-shrink: 0;
      width: 44px;
      height: 44px;
      border: none;
      border-radius: 50%;
      background: #f3f4f6;
      color: #374151;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .nav-button:hover:not(:disabled) {
      background: #e5e7eb;
    }

    .nav-button:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .nav-button svg {
      width: 24px;
      height: 24px;
    }

    .carousel-track {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      overflow: hidden;
      padding: 8px;
    }

    .carousel-item {
      transition: all 0.3s ease;
      flex-shrink: 0;
    }

    .carousel-item.prev,
    .carousel-item.next {
      transform: scale(0.75);
      opacity: 0.5;
      cursor: pointer;
    }

    .carousel-item.prev:hover,
    .carousel-item.next:hover {
      opacity: 0.7;
    }

    .carousel-item.current {
      transform: scale(1);
      opacity: 1;
      position: relative;
    }

    .carousel-item.current.selected {
      transform: scale(1.05);
    }

    .select-hint {
      position: absolute;
      bottom: -24px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 0.75rem;
      color: #6b7280;
      white-space: nowrap;
      transition: opacity 0.2s ease;
    }

    .select-hint.hidden {
      opacity: 0;
    }

    .carousel-dots {
      display: flex;
      justify-content: center;
      gap: 8px;
      padding: 16px 0;
    }

    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      border: none;
      background: #d1d5db;
      cursor: pointer;
      padding: 0;
      transition: all 0.2s ease;
    }

    .dot:hover {
      background: #9ca3af;
    }

    .dot.active {
      background: #3b82f6;
      transform: scale(1.2);
    }

    /* Mobile-first: hide side cards on small screens */
    @media (max-width: 600px) {
      .carousel-item.prev,
      .carousel-item.next {
        display: none;
      }

      .carousel-track {
        gap: 0;
      }

      .nav-button {
        width: 36px;
        height: 36px;
      }

      .nav-button svg {
        width: 20px;
        height: 20px;
      }
    }
  `,
})
export class BirdCarouselComponent {
  birds = input.required<BirdWithPhenotype[]>();
  traitConfigs = input.required<TraitConfig[]>();
  selectedBirdIds = input<Set<string>>(new Set());

  selectBird = output<string>();

  currentIndex = signal(0);

  private touchStartX = 0;
  private touchCurrentX = 0;
  private minSwipeDistance = 50;

  currentBird = computed(() => {
    const allBirds = this.birds();
    if (allBirds.length === 0) return null;
    return allBirds[this.currentIndex()];
  });

  prevBird = computed(() => {
    const allBirds = this.birds();
    if (allBirds.length <= 1) return null;
    const prevIndex = (this.currentIndex() - 1 + allBirds.length) % allBirds.length;
    return allBirds[prevIndex];
  });

  nextBird = computed(() => {
    const allBirds = this.birds();
    if (allBirds.length <= 1) return null;
    const nextIndex = (this.currentIndex() + 1) % allBirds.length;
    return allBirds[nextIndex];
  });

  isCurrentSelected = computed(() => {
    const current = this.currentBird();
    if (!current) return false;
    return this.selectedBirdIds().has(current.id);
  });

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft') {
      this.navigate(-1);
    } else if (event.key === 'ArrowRight') {
      this.navigate(1);
    }
  }

  navigate(direction: number) {
    const allBirds = this.birds();
    if (allBirds.length <= 1) return;

    const newIndex = (this.currentIndex() + direction + allBirds.length) % allBirds.length;
    this.currentIndex.set(newIndex);
  }

  goToIndex(index: number) {
    this.currentIndex.set(index);
  }

  onSelectCurrent() {
    const current = this.currentBird();
    if (current && !this.selectedBirdIds().has(current.id)) {
      this.selectBird.emit(current.id);
    }
  }

  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.touches[0].clientX;
    this.touchCurrentX = this.touchStartX;
  }

  onTouchMove(event: TouchEvent) {
    this.touchCurrentX = event.touches[0].clientX;
  }

  onTouchEnd() {
    const diff = this.touchStartX - this.touchCurrentX;

    if (Math.abs(diff) > this.minSwipeDistance) {
      if (diff > 0) {
        this.navigate(1); // Swipe left = next
      } else {
        this.navigate(-1); // Swipe right = prev
      }
    }

    this.touchStartX = 0;
    this.touchCurrentX = 0;
  }
}
