/**
 * Default Trait Configurations
 * Defines the built-in traits (wing, tail, crest) and trait sets
 */

import { TraitConfig, TraitSetConfig } from './trait-config';

/**
 * Wing Size trait configuration
 * Uses incomplete dominance: WW = Large, Ww = Medium, ww = Small
 */
export const WING_TRAIT: TraitConfig = {
  id: 'wing',
  displayName: 'Wing Size',
  abbreviation: 'w',
  alleles: {
    dominant: 'W',
    recessive: 'w',
  },
  genotypes: ['WW', 'Ww', 'ww'],
  phenotypes: {
    WW: 'Large wings',
    Ww: 'Medium wings',
    ww: 'Small wings',
  },
  phenotypeAbbreviations: {
    WW: 'lw',
    Ww: 'mw',
    ww: 'sw',
  },
};

/**
 * Tail Type trait configuration
 * Uses incomplete dominance: TT = Fan, Tt = Standard, tt = Pointed
 */
export const TAIL_TRAIT: TraitConfig = {
  id: 'tail',
  displayName: 'Tail Type',
  abbreviation: 't',
  alleles: {
    dominant: 'T',
    recessive: 't',
  },
  genotypes: ['TT', 'Tt', 'tt'],
  phenotypes: {
    TT: 'Fan tail',
    Tt: 'Standard tail',
    tt: 'Pointed tail',
  },
  phenotypeAbbreviations: {
    TT: 'ft',
    Tt: 'st',
    tt: 'pt',
  },
};

/**
 * Crest Type trait configuration (for advanced 3-trait games)
 * Uses incomplete dominance: CC = Full crest, Cc = Half crest, cc = No crest
 */
export const CREST_TRAIT: TraitConfig = {
  id: 'crest',
  displayName: 'Crest Type',
  abbreviation: 'c',
  alleles: {
    dominant: 'C',
    recessive: 'c',
  },
  genotypes: ['CC', 'Cc', 'cc'],
  phenotypes: {
    CC: 'Full crest',
    Cc: 'Half crest',
    cc: 'No crest',
  },
  phenotypeAbbreviations: {
    CC: 'fc',
    Cc: 'hc',
    cc: 'nc',
  },
};

/**
 * Map of all available traits by ID
 */
export const ALL_TRAITS: Record<string, TraitConfig> = {
  wing: WING_TRAIT,
  tail: TAIL_TRAIT,
  crest: CREST_TRAIT,
};

/**
 * Basic trait set - 1 trait (wing only)
 */
export const BASIC_TRAIT_SET: TraitSetConfig = {
  id: 'basic',
  name: 'Basic (1 trait)',
  traitIds: ['wing'],
};

/**
 * Standard trait set - 2 traits (wing + tail)
 */
export const STANDARD_TRAIT_SET: TraitSetConfig = {
  id: 'standard',
  name: 'Standard (2 traits)',
  traitIds: ['wing', 'tail'],
};

/**
 * Advanced trait set - 3 traits (wing + tail + crest)
 */
export const ADVANCED_TRAIT_SET: TraitSetConfig = {
  id: 'advanced',
  name: 'Advanced (3 traits)',
  traitIds: ['wing', 'tail', 'crest'],
};

/**
 * Map of all available trait sets by ID
 */
export const ALL_TRAIT_SETS: Record<string, TraitSetConfig> = {
  basic: BASIC_TRAIT_SET,
  standard: STANDARD_TRAIT_SET,
  advanced: ADVANCED_TRAIT_SET,
};

/**
 * Default trait set ID for new games
 */
export const DEFAULT_TRAIT_SET_ID = 'standard';

/**
 * Get trait configs for a trait set
 */
export function getTraitConfigsForSet(traitSetId: string): TraitConfig[] {
  const traitSet = ALL_TRAIT_SETS[traitSetId];
  if (!traitSet) {
    throw new Error(`Unknown trait set: ${traitSetId}`);
  }
  return traitSet.traitIds.map((id) => {
    const trait = ALL_TRAITS[id];
    if (!trait) {
      throw new Error(`Unknown trait: ${id} in trait set ${traitSetId}`);
    }
    return trait;
  });
}

/**
 * Get a single trait config by ID
 */
export function getTraitConfig(traitId: string): TraitConfig {
  const trait = ALL_TRAITS[traitId];
  if (!trait) {
    throw new Error(`Unknown trait: ${traitId}`);
  }
  return trait;
}
