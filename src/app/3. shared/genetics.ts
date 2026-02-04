/**
 * Genetics utilities for Bird Punnett POC
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

export interface Bird {
  id: string;
  wingGenotype: WingGenotype;
  tailGenotype: TailGenotype;
  parentId1?: string;
  parentId2?: string;
}

export interface BirdWithPhenotype extends Bird {
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

export function getBirdWithPhenotype(bird: Bird): BirdWithPhenotype {
  return {
    ...bird,
    wingPhenotype: getWingPhenotype(bird.wingGenotype),
    tailPhenotype: getTailPhenotype(bird.tailGenotype),
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
export function calculateBreedingOutcomes(parent1: Bird, parent2: Bird): BreedingOutcome[] {
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

// Generate image filename for a bird
export function getBirdImagePath(bird: Bird): string {
  const wingAbbrev = bird.wingGenotype === 'WW' ? 'lw' : bird.wingGenotype === 'Ww' ? 'mw' : 'sw';
  const tailAbbrev = bird.tailGenotype === 'TT' ? 'ft' : bird.tailGenotype === 'Tt' ? 'st' : 'pt';
  return `birds/${wingAbbrev}${tailAbbrev}-${bird.wingGenotype}${bird.tailGenotype}.png`;
}

// Check if a bird matches the goal
export function isGoalBird(bird: Bird, goalWing: WingGenotype, goalTail: TailGenotype): boolean {
  return bird.wingGenotype === goalWing && bird.tailGenotype === goalTail;
}

// Starting birds for the fixed run
export function getStartingBirds(): Bird[] {
  return [
    { id: 'A', wingGenotype: 'WW', tailGenotype: 'tt' },
    { id: 'B', wingGenotype: 'ww', tailGenotype: 'TT' },
    { id: 'C', wingGenotype: 'Ww', tailGenotype: 'Tt' },
    { id: 'D', wingGenotype: 'Ww', tailGenotype: 'tt' },
  ];
}

// Goal bird configuration
export const GOAL_WING_GENOTYPE: WingGenotype = 'WW';
export const GOAL_TAIL_GENOTYPE: TailGenotype = 'TT';
export const MAX_BREEDING_STEPS = 10;

// All possible genotypes
const WING_GENOTYPES: WingGenotype[] = ['WW', 'Ww', 'ww'];
const TAIL_GENOTYPES: TailGenotype[] = ['TT', 'Tt', 'tt'];

/**
 * Generates a random goal genotype combination.
 * @param randomFn Optional random function (0-1). Defaults to Math.random.
 * @returns Object with random wing and tail genotypes
 */
export function getRandomGoal(randomFn: () => number = Math.random): {
  wingGenotype: WingGenotype;
  tailGenotype: TailGenotype;
} {
  const wingGenotype = WING_GENOTYPES[Math.floor(randomFn() * WING_GENOTYPES.length)];
  const tailGenotype = TAIL_GENOTYPES[Math.floor(randomFn() * TAIL_GENOTYPES.length)];
  return { wingGenotype, tailGenotype };
}

/**
 * Generates random starting birds, excluding the goal genotype.
 * @param goalWing The goal wing genotype to exclude
 * @param goalTail The goal tail genotype to exclude
 * @param randomFn Optional random function (0-1). Defaults to Math.random.
 * @returns Array of 4 random birds that don't match the goal
 */
export function getRandomStartingBirds(
  goalWing: WingGenotype,
  goalTail: TailGenotype,
  randomFn: () => number = Math.random
): Bird[] {
  const ids = ['A', 'B', 'C', 'D'];
  return ids.map((id) => {
    let wingGenotype: WingGenotype;
    let tailGenotype: TailGenotype;

    // Keep generating until we get a non-goal combination
    do {
      wingGenotype = WING_GENOTYPES[Math.floor(randomFn() * WING_GENOTYPES.length)];
      tailGenotype = TAIL_GENOTYPES[Math.floor(randomFn() * TAIL_GENOTYPES.length)];
    } while (wingGenotype === goalWing && tailGenotype === goalTail);

    return { id, wingGenotype, tailGenotype };
  });
}
