/**
 * Genetics utilities for Pigeon Punnett POC
 * Uses incomplete dominance for both traits
 */

// Wing alleles: W (dominant) and w (recessive)
// Tail alleles: T (dominant) and t (recessive)
export type WingAllele = 'W' | 'w';
export type TailAllele = 'T' | 't';

export type WingGenotype = 'WW' | 'Ww' | 'ww';
export type TailGenotype = 'TT' | 'Tt' | 'tt';

export type WingPhenotype = 'Large wings' | 'Medium wings' | 'Small wings';
export type TailPhenotype = 'Fan tail' | 'Standard tail' | 'Pointed tail';

export interface Pigeon {
  id: string;
  wingGenotype: WingGenotype;
  tailGenotype: TailGenotype;
  parentId1?: string;
  parentId2?: string;
}

export interface PigeonWithPhenotype extends Pigeon {
  wingPhenotype: WingPhenotype;
  tailPhenotype: TailPhenotype;
}

export interface PunnettSquare {
  parent1Alleles: [string, string];
  parent2Alleles: [string, string];
  grid: [string, string, string, string]; // row-major: [0,0], [0,1], [1,0], [1,1]
}

export interface OutcomeProbability {
  genotype: string;
  probability: number;
  count: number;
}

export interface BreedingOutcome {
  wingGenotype: WingGenotype;
  tailGenotype: TailGenotype;
  probability: number;
}

// Genotype to Phenotype mappings (incomplete dominance)
export function getWingPhenotype(genotype: WingGenotype): WingPhenotype {
  switch (genotype) {
    case 'WW':
      return 'Large wings';
    case 'Ww':
      return 'Medium wings';
    case 'ww':
      return 'Small wings';
  }
}

export function getTailPhenotype(genotype: TailGenotype): TailPhenotype {
  switch (genotype) {
    case 'TT':
      return 'Fan tail';
    case 'Tt':
      return 'Standard tail';
    case 'tt':
      return 'Pointed tail';
  }
}

export function getPigeonWithPhenotype(pigeon: Pigeon): PigeonWithPhenotype {
  return {
    ...pigeon,
    wingPhenotype: getWingPhenotype(pigeon.wingGenotype),
    tailPhenotype: getTailPhenotype(pigeon.tailGenotype),
  };
}

// Normalize genotype to consistent format (uppercase allele first)
export function normalizeGenotype<T extends string>(allele1: T, allele2: T): string {
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

// Get alleles from genotype
export function getAlleles(genotype: string): [string, string] {
  return [genotype[0], genotype[1]];
}

// Generate Punnett square for a single trait
export function generatePunnettSquare(parent1Genotype: string, parent2Genotype: string): PunnettSquare {
  const parent1Alleles = getAlleles(parent1Genotype);
  const parent2Alleles = getAlleles(parent2Genotype);

  const grid: [string, string, string, string] = [
    normalizeGenotype(parent1Alleles[0], parent2Alleles[0]),
    normalizeGenotype(parent1Alleles[0], parent2Alleles[1]),
    normalizeGenotype(parent1Alleles[1], parent2Alleles[0]),
    normalizeGenotype(parent1Alleles[1], parent2Alleles[1]),
  ];

  return {
    parent1Alleles,
    parent2Alleles,
    grid,
  };
}

// Calculate outcome probabilities from a Punnett square
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

// Calculate combined breeding outcomes (both traits)
export function calculateBreedingOutcomes(parent1: Pigeon, parent2: Pigeon): BreedingOutcome[] {
  const wingSquare = generatePunnettSquare(parent1.wingGenotype, parent2.wingGenotype);
  const tailSquare = generatePunnettSquare(parent1.tailGenotype, parent2.tailGenotype);

  const wingProbs = calculateProbabilities(wingSquare);
  const tailProbs = calculateProbabilities(tailSquare);

  const outcomes: BreedingOutcome[] = [];

  for (const wingOutcome of wingProbs) {
    for (const tailOutcome of tailProbs) {
      outcomes.push({
        wingGenotype: wingOutcome.genotype as WingGenotype,
        tailGenotype: tailOutcome.genotype as TailGenotype,
        probability: wingOutcome.probability * tailOutcome.probability,
      });
    }
  }

  // Sort by probability descending, then by genotype for deterministic ordering
  return outcomes.sort(
    (a, b) =>
      b.probability - a.probability ||
      a.wingGenotype.localeCompare(b.wingGenotype) ||
      a.tailGenotype.localeCompare(b.tailGenotype)
  );
}

/**
 * Selects offspring based on breeding outcome probabilities.
 * @param outcomes Array of possible outcomes with probabilities
 * @param count Number of offspring to select
 * @param randomFn Optional random function (0-1). If not provided, uses deterministic selection.
 * @returns Array of selected offspring genotypes
 */
export function selectOffspring(
  outcomes: BreedingOutcome[],
  count: number = 2,
  randomFn?: () => number
): { wingGenotype: WingGenotype; tailGenotype: TailGenotype }[] {
  const result: { wingGenotype: WingGenotype; tailGenotype: TailGenotype }[] = [];

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

    result.push({
      wingGenotype: selectedOutcome.wingGenotype,
      tailGenotype: selectedOutcome.tailGenotype,
    });
  }

  return result;
}

// Generate image filename for a pigeon
export function getPigeonImagePath(pigeon: Pigeon): string {
  const wingAbbrev = pigeon.wingGenotype === 'WW' ? 'lw' : pigeon.wingGenotype === 'Ww' ? 'mw' : 'sw';
  const tailAbbrev = pigeon.tailGenotype === 'TT' ? 'ft' : pigeon.tailGenotype === 'Tt' ? 'st' : 'pt';
  return `pigeons/${wingAbbrev}${tailAbbrev}-${pigeon.wingGenotype}${pigeon.tailGenotype}.png`;
}

// Check if a pigeon matches the goal
export function isGoalPigeon(pigeon: Pigeon, goalWing: WingGenotype, goalTail: TailGenotype): boolean {
  return pigeon.wingGenotype === goalWing && pigeon.tailGenotype === goalTail;
}

// Starting pigeons for the fixed run
export function getStartingPigeons(): Pigeon[] {
  return [
    { id: 'A', wingGenotype: 'WW', tailGenotype: 'tt' },
    { id: 'B', wingGenotype: 'ww', tailGenotype: 'TT' },
    { id: 'C', wingGenotype: 'Ww', tailGenotype: 'Tt' },
    { id: 'D', wingGenotype: 'Ww', tailGenotype: 'tt' },
  ];
}

// Goal pigeon configuration
export const GOAL_WING_GENOTYPE: WingGenotype = 'WW';
export const GOAL_TAIL_GENOTYPE: TailGenotype = 'TT';
export const MAX_BREEDING_STEPS = 10;
