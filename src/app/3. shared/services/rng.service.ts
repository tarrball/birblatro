import { Injectable } from '@angular/core';

/**
 * Random number generation service.
 * Wraps Math.random() to allow dependency injection and deterministic testing.
 */
@Injectable({
  providedIn: 'root',
})
export class RngService {
  /**
   * Returns a random number between 0 (inclusive) and 1 (exclusive).
   */
  random(): number {
    return Math.random();
  }

  /**
   * Selects an item from an array of weighted options based on their probabilities.
   * @param options Array of options with probability weights (should sum to 1)
   * @returns The selected option
   */
  selectWeighted<T extends { probability: number }>(options: T[]): T {
    const rand = this.random();
    let cumulative = 0;

    for (const option of options) {
      cumulative += option.probability;
      if (rand < cumulative) {
        return option;
      }
    }

    // Fallback to last option (handles floating point rounding)
    return options[options.length - 1];
  }
}
