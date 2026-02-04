/**
 * Genetics Module
 * Re-exports all genetics functionality
 */

// Trait configuration
export type { TraitConfig, TraitSetConfig } from './trait-config';
export {
  getPhenotype,
  getPhenotypeAbbreviation,
  isValidGenotype,
  getGenotypes,
} from './trait-config';

// Default trait definitions
export {
  WING_TRAIT,
  TAIL_TRAIT,
  CREST_TRAIT,
  ALL_TRAITS,
  BASIC_TRAIT_SET,
  STANDARD_TRAIT_SET,
  ADVANCED_TRAIT_SET,
  ALL_TRAIT_SETS,
  DEFAULT_TRAIT_SET_ID,
  getTraitConfigsForSet,
  getTraitConfig,
} from './default-traits';

// Bird types and utilities
export type {
  Genotypes,
  Phenotypes,
  Bird,
  BirdWithPhenotype,
  PunnettSquare,
  OutcomeProbability,
  BreedingOutcome,
  BreedingResult,
} from './bird';
export {
  computePhenotypes,
  getBirdWithPhenotype,
  getBirdImagePath,
  isGoalBird,
  createBird,
} from './bird';

// Breeding logic
export {
  normalizeGenotype,
  getAlleles,
  generatePunnettSquare,
  calculateProbabilities,
  generatePunnettSquares,
  calculateBreedingOutcomes,
  selectOffspring,
  getStartingBirds,
  getRandomGoal,
  getRandomStartingBirds,
  MAX_BREEDING_STEPS,
} from './breeding';
