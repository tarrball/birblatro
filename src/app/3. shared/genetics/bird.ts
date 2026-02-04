/**
 * Generic Bird Types
 * Supports any number of traits via Record types
 */

import { TraitConfig, getPhenotype, getPhenotypeAbbreviation } from './trait-config';
import { ALL_TRAITS, STANDARD_TRAIT_SET, getTraitConfigsForSet } from './default-traits';

/**
 * Maps trait IDs to genotypes (e.g., { wing: 'Ww', tail: 'TT' })
 */
export type Genotypes = Record<string, string>;

/**
 * Maps trait IDs to phenotypes (e.g., { wing: 'Medium wings', tail: 'Fan tail' })
 */
export type Phenotypes = Record<string, string>;

/**
 * A bird with genetic makeup for any number of traits
 */
export interface Bird {
  /** Unique identifier for this bird */
  id: string;

  /** Genotype for each active trait */
  genotypes: Genotypes;

  /** Parent bird ID (if bred) */
  parentId1?: string;

  /** Parent bird ID (if bred) */
  parentId2?: string;
}

/**
 * A bird with computed phenotypes for display
 */
export interface BirdWithPhenotype extends Bird {
  /** Phenotype for each active trait */
  phenotypes: Phenotypes;
}

/**
 * Punnett square for a single trait
 */
export interface PunnettSquare {
  /** ID of the trait this square is for */
  traitId: string;

  /** Alleles from parent 1 */
  parent1Alleles: [string, string];

  /** Alleles from parent 2 */
  parent2Alleles: [string, string];

  /** Grid of possible genotypes (2x2, row-major order) */
  grid: [string, string, string, string];
}

/**
 * Probability info for a single genotype
 */
export interface OutcomeProbability {
  genotype: string;
  probability: number;
  count: number;
}

/**
 * A possible breeding outcome with combined probability
 */
export interface BreedingOutcome {
  /** Genotypes for all traits */
  genotypes: Genotypes;

  /** Combined probability of this outcome */
  probability: number;
}

/**
 * Complete result of a breeding operation
 */
export interface BreedingResult {
  /** Punnett square for each trait */
  squares: PunnettSquare[];

  /** All possible outcomes with probabilities */
  outcomes: BreedingOutcome[];

  /** The offspring produced */
  offspring: Bird[];
}

/**
 * Get phenotypes for all traits of a bird
 */
export function computePhenotypes(bird: Bird, traitConfigs: TraitConfig[]): Phenotypes {
  const phenotypes: Phenotypes = {};

  for (const config of traitConfigs) {
    const genotype = bird.genotypes[config.id];
    if (genotype) {
      phenotypes[config.id] = getPhenotype(config, genotype);
    }
  }

  return phenotypes;
}

/**
 * Convert a Bird to BirdWithPhenotype
 */
export function getBirdWithPhenotype(bird: Bird, traitConfigs: TraitConfig[]): BirdWithPhenotype {
  return {
    ...bird,
    phenotypes: computePhenotypes(bird, traitConfigs),
  };
}

/**
 * Generate image path for a bird based on its genotypes
 * Falls back to placeholder for unsupported trait combinations
 */
export function getBirdImagePath(bird: Bird, traitConfigs: TraitConfig[]): string {
  // Only generate real paths for the standard 2-trait (wing+tail) combination
  const traitIds = traitConfigs.map((c) => c.id);
  const isStandardTraitSet =
    traitIds.length === 2 && traitIds.includes('wing') && traitIds.includes('tail');

  if (!isStandardTraitSet) {
    return 'birds/placeholder.svg';
  }

  const wingConfig = ALL_TRAITS['wing'];
  const tailConfig = ALL_TRAITS['tail'];
  const wingGenotype = bird.genotypes['wing'];
  const tailGenotype = bird.genotypes['tail'];

  if (!wingGenotype || !tailGenotype) {
    return 'birds/placeholder.svg';
  }

  const wingAbbrev = getPhenotypeAbbreviation(wingConfig, wingGenotype);
  const tailAbbrev = getPhenotypeAbbreviation(tailConfig, tailGenotype);

  return `birds/${wingAbbrev}${tailAbbrev}-${wingGenotype}${tailGenotype}.png`;
}

/**
 * Check if a bird matches the goal genotypes
 */
export function isGoalBird(bird: Bird, goalGenotypes: Genotypes): boolean {
  for (const traitId of Object.keys(goalGenotypes)) {
    if (bird.genotypes[traitId] !== goalGenotypes[traitId]) {
      return false;
    }
  }
  return true;
}

/**
 * Create a bird with specific genotypes
 */
export function createBird(
  id: string,
  genotypes: Genotypes,
  parentId1?: string,
  parentId2?: string
): Bird {
  return {
    id,
    genotypes,
    ...(parentId1 && { parentId1 }),
    ...(parentId2 && { parentId2 }),
  };
}
