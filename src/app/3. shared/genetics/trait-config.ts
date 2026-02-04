/**
 * Trait Configuration Types
 * Defines the structure for configurable genetic traits
 */

/**
 * Configuration for a single genetic trait
 */
export interface TraitConfig {
  /** Unique identifier for the trait (e.g., 'wing', 'tail', 'crest') */
  id: string;

  /** Human-readable name (e.g., 'Wing Size') */
  displayName: string;

  /** Short abbreviation for image paths (e.g., 'w' for wings) */
  abbreviation: string;

  /** The alleles for this trait */
  alleles: {
    /** Dominant allele letter (uppercase, e.g., 'W') */
    dominant: string;
    /** Recessive allele letter (lowercase, e.g., 'w') */
    recessive: string;
  };

  /** All possible genotypes for this trait */
  genotypes: string[];

  /** Maps genotype to phenotype description (e.g., { 'WW': 'Large wings' }) */
  phenotypes: Record<string, string>;

  /** Maps genotype to abbreviation for image paths (e.g., { 'WW': 'lw' }) */
  phenotypeAbbreviations: Record<string, string>;
}

/**
 * Configuration for a set of traits used in a game level
 */
export interface TraitSetConfig {
  /** Unique identifier (e.g., 'basic', 'standard', 'advanced') */
  id: string;

  /** Human-readable name (e.g., 'Standard (2 traits)') */
  name: string;

  /** Ordered list of trait IDs to use (e.g., ['wing', 'tail']) */
  traitIds: string[];
}

/**
 * Get phenotype for a genotype from trait config
 */
export function getPhenotype(traitConfig: TraitConfig, genotype: string): string {
  const phenotype = traitConfig.phenotypes[genotype];
  if (!phenotype) {
    throw new Error(`Unknown genotype '${genotype}' for trait '${traitConfig.id}'`);
  }
  return phenotype;
}

/**
 * Get phenotype abbreviation for a genotype from trait config
 */
export function getPhenotypeAbbreviation(traitConfig: TraitConfig, genotype: string): string {
  const abbrev = traitConfig.phenotypeAbbreviations[genotype];
  if (!abbrev) {
    throw new Error(`Unknown genotype '${genotype}' for trait '${traitConfig.id}'`);
  }
  return abbrev;
}

/**
 * Validate that a genotype is valid for a trait
 */
export function isValidGenotype(traitConfig: TraitConfig, genotype: string): boolean {
  return traitConfig.genotypes.includes(genotype);
}

/**
 * Get all possible genotypes from a trait config
 */
export function getGenotypes(traitConfig: TraitConfig): string[] {
  return [...traitConfig.genotypes];
}
