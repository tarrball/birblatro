/**
 * Generic Breeding Logic
 * Supports breeding for any number of traits via Cartesian product
 */

import { TraitConfig } from './trait-config';
import { ALL_TRAITS, getTraitConfigsForSet, DEFAULT_TRAIT_SET_ID } from './default-traits';
import {
  Bird,
  Genotypes,
  PunnettSquare,
  OutcomeProbability,
  BreedingOutcome,
  createBird,
} from './bird';

/**
 * Normalize genotype to consistent format (uppercase allele first)
 */
export function normalizeGenotype(allele1: string, allele2: string): string {
  const isFirstUppercase = allele1 === allele1.toUpperCase();
  const isSecondUppercase = allele2 === allele2.toUpperCase();

  if (isFirstUppercase && !isSecondUppercase) {
    return `${allele1}${allele2}`;
  }
  if (!isFirstUppercase && isSecondUppercase) {
    return `${allele2}${allele1}`;
  }
  // Both same case - sort alphabetically for consistency
  return allele1 <= allele2 ? `${allele1}${allele2}` : `${allele2}${allele1}`;
}

/**
 * Extract alleles from a genotype string
 */
export function getAlleles(genotype: string): [string, string] {
  return [genotype[0], genotype[1]];
}

/**
 * Generate Punnett square for a single trait
 */
export function generatePunnettSquare(
  traitId: string,
  parent1Genotype: string,
  parent2Genotype: string
): PunnettSquare {
  const parent1Alleles = getAlleles(parent1Genotype);
  const parent2Alleles = getAlleles(parent2Genotype);

  const grid: [string, string, string, string] = [
    normalizeGenotype(parent1Alleles[0], parent2Alleles[0]),
    normalizeGenotype(parent1Alleles[0], parent2Alleles[1]),
    normalizeGenotype(parent1Alleles[1], parent2Alleles[0]),
    normalizeGenotype(parent1Alleles[1], parent2Alleles[1]),
  ];

  return {
    traitId,
    parent1Alleles,
    parent2Alleles,
    grid,
  };
}

/**
 * Calculate outcome probabilities from a Punnett square
 */
export function calculateProbabilities(punnettSquare: PunnettSquare): OutcomeProbability[] {
  const counts = new Map<string, number>();

  for (const genotype of punnettSquare.grid) {
    counts.set(genotype, (counts.get(genotype) || 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([genotype, count]) => ({
      genotype,
      probability: count / 4,
      count,
    }))
    .sort((a, b) => b.probability - a.probability || a.genotype.localeCompare(b.genotype));
}

/**
 * Generate Punnett squares for all traits
 */
export function generatePunnettSquares(
  parent1: Bird,
  parent2: Bird,
  traitConfigs: TraitConfig[]
): PunnettSquare[] {
  return traitConfigs.map((config) =>
    generatePunnettSquare(config.id, parent1.genotypes[config.id], parent2.genotypes[config.id])
  );
}

/**
 * Calculate breeding outcomes for all traits using Cartesian product
 */
export function calculateBreedingOutcomes(
  parent1: Bird,
  parent2: Bird,
  traitConfigs: TraitConfig[]
): BreedingOutcome[] {
  // Generate squares and probabilities for each trait
  const traitProbabilities: Array<{
    traitId: string;
    probs: OutcomeProbability[];
  }> = traitConfigs.map((config) => {
    const square = generatePunnettSquare(
      config.id,
      parent1.genotypes[config.id],
      parent2.genotypes[config.id]
    );
    return {
      traitId: config.id,
      probs: calculateProbabilities(square),
    };
  });

  // Calculate Cartesian product of all trait outcomes
  const outcomes: BreedingOutcome[] = [];
  const cartesianProduct = (
    current: Genotypes,
    currentProbability: number,
    traitIndex: number
  ): void => {
    if (traitIndex >= traitProbabilities.length) {
      outcomes.push({
        genotypes: { ...current },
        probability: currentProbability,
      });
      return;
    }

    const { traitId, probs } = traitProbabilities[traitIndex];
    for (const prob of probs) {
      cartesianProduct(
        { ...current, [traitId]: prob.genotype },
        currentProbability * prob.probability,
        traitIndex + 1
      );
    }
  };

  cartesianProduct({}, 1, 0);

  // Sort by probability descending, then by genotypes for deterministic ordering
  return outcomes.sort((a, b) => {
    const probDiff = b.probability - a.probability;
    if (probDiff !== 0) return probDiff;

    // Sort by trait genotypes in order
    for (const config of traitConfigs) {
      const cmp = a.genotypes[config.id].localeCompare(b.genotypes[config.id]);
      if (cmp !== 0) return cmp;
    }
    return 0;
  });
}

/**
 * Select offspring based on breeding outcome probabilities
 */
export function selectOffspring(
  outcomes: BreedingOutcome[],
  count: number = 2,
  randomFn?: () => number
): Genotypes[] {
  const result: Genotypes[] = [];

  for (let i = 0; i < count; i++) {
    let selectedOutcome: BreedingOutcome;

    if (randomFn) {
      // Probability-based random selection
      const rand = randomFn();
      let cumulative = 0;
      selectedOutcome = outcomes[outcomes.length - 1]; // fallback

      for (const outcome of outcomes) {
        cumulative += outcome.probability;
        if (rand < cumulative) {
          selectedOutcome = outcome;
          break;
        }
      }
    } else {
      // Deterministic: pick top outcomes in order (for backwards compatibility)
      selectedOutcome = outcomes[i % outcomes.length];
    }

    result.push({ ...selectedOutcome.genotypes });
  }

  return result;
}

/**
 * Get starting birds for a trait set
 */
export function getStartingBirds(traitSetId: string = DEFAULT_TRAIT_SET_ID): Bird[] {
  const traitConfigs = getTraitConfigsForSet(traitSetId);
  const ids = ['A', 'B', 'C', 'D'];

  // For standard 2-trait (wing+tail), use the original starting birds
  if (traitSetId === 'standard') {
    return [
      createBird('A', { wing: 'WW', tail: 'tt' }),
      createBird('B', { wing: 'ww', tail: 'TT' }),
      createBird('C', { wing: 'Ww', tail: 'Tt' }),
      createBird('D', { wing: 'Ww', tail: 'tt' }),
    ];
  }

  // For basic 1-trait (wing only)
  if (traitSetId === 'basic') {
    return [
      createBird('A', { wing: 'WW' }),
      createBird('B', { wing: 'ww' }),
      createBird('C', { wing: 'Ww' }),
      createBird('D', { wing: 'Ww' }),
    ];
  }

  // For advanced 3-trait (wing+tail+crest)
  if (traitSetId === 'advanced') {
    return [
      createBird('A', { wing: 'WW', tail: 'tt', crest: 'Cc' }),
      createBird('B', { wing: 'ww', tail: 'TT', crest: 'cc' }),
      createBird('C', { wing: 'Ww', tail: 'Tt', crest: 'CC' }),
      createBird('D', { wing: 'Ww', tail: 'tt', crest: 'Cc' }),
    ];
  }

  // Fallback: generate default birds
  return ids.map((id, index) => {
    const genotypes: Genotypes = {};
    for (const config of traitConfigs) {
      // Vary genotypes for diversity
      genotypes[config.id] = config.genotypes[index % config.genotypes.length];
    }
    return createBird(id, genotypes);
  });
}

/**
 * Get random goal genotypes for a trait set
 */
export function getRandomGoal(
  traitSetId: string = DEFAULT_TRAIT_SET_ID,
  randomFn: () => number = Math.random
): Genotypes {
  const traitConfigs = getTraitConfigsForSet(traitSetId);
  const goal: Genotypes = {};

  for (const config of traitConfigs) {
    const index = Math.floor(randomFn() * config.genotypes.length);
    goal[config.id] = config.genotypes[index];
  }

  return goal;
}

/**
 * Generate random starting birds that don't match the goal
 */
export function getRandomStartingBirds(
  goalGenotypes: Genotypes,
  traitSetId: string = DEFAULT_TRAIT_SET_ID,
  randomFn: () => number = Math.random
): Bird[] {
  const traitConfigs = getTraitConfigsForSet(traitSetId);
  const ids = ['A', 'B', 'C', 'D'];

  return ids.map((id) => {
    let genotypes: Genotypes;

    // Keep generating until we get a non-goal combination
    do {
      genotypes = {};
      for (const config of traitConfigs) {
        const index = Math.floor(randomFn() * config.genotypes.length);
        genotypes[config.id] = config.genotypes[index];
      }
    } while (matchesGoal(genotypes, goalGenotypes));

    return createBird(id, genotypes);
  });
}

/**
 * Check if genotypes match the goal (all traits)
 */
function matchesGoal(genotypes: Genotypes, goalGenotypes: Genotypes): boolean {
  for (const traitId of Object.keys(goalGenotypes)) {
    if (genotypes[traitId] !== goalGenotypes[traitId]) {
      return false;
    }
  }
  return true;
}

/**
 * Maximum breeding steps
 */
export const MAX_BREEDING_STEPS = 10;
