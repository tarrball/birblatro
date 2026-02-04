import { Bird, PunnettSquare, BreedingOutcome, Genotypes, DEFAULT_TRAIT_SET_ID } from '../../3. shared/genetics';

export type GamePhase = 'intro' | 'tutorial' | 'deck' | 'breed' | 'result' | 'win' | 'lose';

export interface BreedingResult {
  /** Punnett squares for each trait */
  squares: PunnettSquare[];
  /** All possible outcomes with probabilities */
  outcomes: BreedingOutcome[];
  /** Offspring produced from this breeding */
  offspring: Bird[];
}

export interface GameState {
  phase: GamePhase;
  birds: Bird[];
  selectedParent1Id: string | null;
  selectedParent2Id: string | null;
  lastBreedingResult: BreedingResult | null;
  stepsRemaining: number;
  /** Goal genotypes for each active trait */
  goalGenotypes: Genotypes;
  /** Active trait set ID */
  activeTraitSetId: string;
}

export const initialGameState: GameState = {
  phase: 'intro',
  birds: [],
  selectedParent1Id: null,
  selectedParent2Id: null,
  lastBreedingResult: null,
  stepsRemaining: 3,
  goalGenotypes: { wing: 'WW', tail: 'TT' },
  activeTraitSetId: DEFAULT_TRAIT_SET_ID,
};
