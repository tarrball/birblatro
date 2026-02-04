/**
 * Game Validation Module
 * Implements BFS-based reachability check for Mendelian breeding
 */

import { Bird, Genotypes } from './bird';
import { TraitConfig } from './trait-config';

/**
 * Genotype state for a single trait (encoded as 0, 1, 2)
 * 0 = homozygous dominant (AA)
 * 1 = heterozygous (Aa)
 * 2 = homozygous recessive (aa)
 */
type TraitState = 0 | 1 | 2;

/**
 * Precomputed single-trait cross results
 * offspringStates[parent1State][parent2State] = bitmask of possible offspring states
 * Bit 0 = AA possible, Bit 1 = Aa possible, Bit 2 = aa possible
 */
const OFFSPRING_STATES: number[][] = [
  // Parent 1 = AA (0)
  [0b001, 0b011, 0b010], // AA×AA={AA}, AA×Aa={AA,Aa}, AA×aa={Aa}
  // Parent 1 = Aa (1)
  [0b011, 0b111, 0b110], // Aa×AA={AA,Aa}, Aa×Aa={AA,Aa,aa}, Aa×aa={Aa,aa}
  // Parent 1 = aa (2)
  [0b010, 0b110, 0b100], // aa×AA={Aa}, aa×Aa={Aa,aa}, aa×aa={aa}
];

/**
 * Encode a genotype string to a trait state
 */
function encodeTraitState(genotype: string): TraitState {
  const upper = genotype[0].toUpperCase();
  const isFirstUpper = genotype[0] === upper;
  const isSecondUpper = genotype[1] === genotype[1].toUpperCase();

  if (isFirstUpper && isSecondUpper) return 0; // AA
  if (!isFirstUpper && !isSecondUpper) return 2; // aa
  return 1; // Aa
}

/**
 * Encode a full genotype (all traits) as a base-3 integer
 */
function encodeGenotype(genotypes: Genotypes, traitConfigs: TraitConfig[]): number {
  let encoded = 0;
  let multiplier = 1;

  for (const config of traitConfigs) {
    const genotype = genotypes[config.id];
    const state = encodeTraitState(genotype);
    encoded += state * multiplier;
    multiplier *= 3;
  }

  return encoded;
}

/**
 * Decode a base-3 integer back to trait states array
 */
function decodeToStates(encoded: number, numTraits: number): TraitState[] {
  const states: TraitState[] = [];
  let remaining = encoded;

  for (let i = 0; i < numTraits; i++) {
    states.push((remaining % 3) as TraitState);
    remaining = Math.floor(remaining / 3);
  }

  return states;
}

/**
 * Compute all possible children from two parent genotypes (encoded)
 * Returns a Set of encoded child genotypes
 */
function computePossibleChildren(
  parent1Encoded: number,
  parent2Encoded: number,
  numTraits: number,
  cache: Map<number, Set<number>>
): Set<number> {
  // Use canonical ordering for cache key
  const minParent = Math.min(parent1Encoded, parent2Encoded);
  const maxParent = Math.max(parent1Encoded, parent2Encoded);
  const cacheKey = minParent * 100000 + maxParent; // Assumes < 100000 genotypes

  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const parent1States = decodeToStates(parent1Encoded, numTraits);
  const parent2States = decodeToStates(parent2Encoded, numTraits);

  // Get offspring masks for each trait
  const traitMasks: number[] = [];
  for (let i = 0; i < numTraits; i++) {
    traitMasks.push(OFFSPRING_STATES[parent1States[i]][parent2States[i]]);
  }

  // Expand to full genotypes using DP
  let currentSet = new Set<number>([0]);

  for (let traitIndex = 0; traitIndex < numTraits; traitIndex++) {
    const nextSet = new Set<number>();
    const mask = traitMasks[traitIndex];
    const multiplier = Math.pow(3, traitIndex);

    for (const partial of currentSet) {
      // Check each possible state for this trait
      for (let state = 0; state < 3; state++) {
        if (mask & (1 << state)) {
          nextSet.add(partial + state * multiplier);
        }
      }
    }

    currentSet = nextSet;
  }

  cache.set(cacheKey, currentSet);
  return currentSet;
}

/**
 * Fast rejection check: determine if an allele required by the goal
 * is completely absent from the starting pool
 */
function fastReject(
  startingBirds: Bird[],
  goalGenotypes: Genotypes,
  traitConfigs: TraitConfig[]
): boolean {
  for (const config of traitConfigs) {
    const goalGenotype = goalGenotypes[config.id];
    const goalState = encodeTraitState(goalGenotype);

    // Check what alleles are needed for this goal state
    const needsDominant = goalState === 0 || goalState === 1; // AA or Aa needs dominant
    const needsRecessive = goalState === 1 || goalState === 2; // Aa or aa needs recessive

    // Check what alleles exist in starting pool
    let hasDominant = false;
    let hasRecessive = false;

    for (const bird of startingBirds) {
      const genotype = bird.genotypes[config.id];
      const state = encodeTraitState(genotype);

      if (state === 0 || state === 1) hasDominant = true; // AA or Aa has dominant
      if (state === 1 || state === 2) hasRecessive = true; // Aa or aa has recessive
    }

    if (needsDominant && !hasDominant) return true;
    if (needsRecessive && !hasRecessive) return true;
  }

  return false;
}

/**
 * Check if a goal genotype is reachable from starting birds via breeding
 *
 * @param startingBirds - Initial set of birds
 * @param goalGenotypes - Target genotype to reach
 * @param traitConfigs - Trait configurations
 * @param maxGenerations - Optional limit on breeding generations (null = unlimited)
 * @returns true if the goal is reachable, false otherwise
 */
export function isGoalReachable(
  startingBirds: Bird[],
  goalGenotypes: Genotypes,
  traitConfigs: TraitConfig[],
  maxGenerations: number | null = null
): boolean {
  const numTraits = traitConfigs.length;

  // Fast rejection check
  if (fastReject(startingBirds, goalGenotypes, traitConfigs)) {
    return false;
  }

  // Encode goal
  const goalEncoded = encodeGenotype(goalGenotypes, traitConfigs);

  // Encode starting genotypes
  const startEncodedSet = new Set<number>();
  for (const bird of startingBirds) {
    startEncodedSet.add(encodeGenotype(bird.genotypes, traitConfigs));
  }

  // Check if goal is already in starting set
  if (startEncodedSet.has(goalEncoded)) {
    return true;
  }

  // BFS
  const visited = new Set(startEncodedSet);
  let frontier = new Set(startEncodedSet);
  const cache = new Map<number, Set<number>>();
  let generation = 0;

  while (frontier.size > 0) {
    if (maxGenerations !== null && generation >= maxGenerations) {
      break;
    }

    const nextFrontier = new Set<number>();

    // For each pair in visited × frontier
    for (const p1 of visited) {
      for (const p2 of frontier) {
        const children = computePossibleChildren(p1, p2, numTraits, cache);

        for (const child of children) {
          if (child === goalEncoded) {
            return true;
          }

          if (!visited.has(child)) {
            visited.add(child);
            nextFrontier.add(child);
          }
        }
      }
    }

    frontier = nextFrontier;
    generation++;
  }

  return false;
}

/**
 * Validation result with details
 */
export interface ValidationResult {
  isValid: boolean;
  /** Number of generations explored before finding goal (or giving up) */
  generationsExplored: number;
  /** Total unique genotypes discovered */
  genotypesDiscovered: number;
}

/**
 * Validate a game configuration with detailed results
 */
export function validateGame(
  startingBirds: Bird[],
  goalGenotypes: Genotypes,
  traitConfigs: TraitConfig[],
  maxGenerations: number | null = null
): ValidationResult {
  const numTraits = traitConfigs.length;

  // Fast rejection check
  if (fastReject(startingBirds, goalGenotypes, traitConfigs)) {
    return {
      isValid: false,
      generationsExplored: 0,
      genotypesDiscovered: startingBirds.length,
    };
  }

  // Encode goal
  const goalEncoded = encodeGenotype(goalGenotypes, traitConfigs);

  // Encode starting genotypes
  const startEncodedSet = new Set<number>();
  for (const bird of startingBirds) {
    startEncodedSet.add(encodeGenotype(bird.genotypes, traitConfigs));
  }

  // Check if goal is already in starting set
  if (startEncodedSet.has(goalEncoded)) {
    return {
      isValid: true,
      generationsExplored: 0,
      genotypesDiscovered: startEncodedSet.size,
    };
  }

  // BFS
  const visited = new Set(startEncodedSet);
  let frontier = new Set(startEncodedSet);
  const cache = new Map<number, Set<number>>();
  let generation = 0;

  while (frontier.size > 0) {
    if (maxGenerations !== null && generation >= maxGenerations) {
      break;
    }

    const nextFrontier = new Set<number>();

    for (const p1 of visited) {
      for (const p2 of frontier) {
        const children = computePossibleChildren(p1, p2, numTraits, cache);

        for (const child of children) {
          if (child === goalEncoded) {
            return {
              isValid: true,
              generationsExplored: generation + 1,
              genotypesDiscovered: visited.size + nextFrontier.size + 1,
            };
          }

          if (!visited.has(child)) {
            visited.add(child);
            nextFrontier.add(child);
          }
        }
      }
    }

    frontier = nextFrontier;
    generation++;
  }

  return {
    isValid: false,
    generationsExplored: generation,
    genotypesDiscovered: visited.size,
  };
}
