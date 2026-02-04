import { Bird, PunnettSquare, BreedingOutcome, WingGenotype, TailGenotype } from '../../3. shared/genetics';

export type GamePhase = 'intro' | 'tutorial' | 'deck' | 'breed' | 'result' | 'win' | 'lose';

export interface BreedingResult {
  wingSquare: PunnettSquare;
  tailSquare: PunnettSquare;
  outcomes: BreedingOutcome[];
  offspring: Bird[];
}

export interface GameState {
  phase: GamePhase;
  birds: Bird[];
  selectedParent1Id: string | null;
  selectedParent2Id: string | null;
  lastBreedingResult: BreedingResult | null;
  stepsRemaining: number;
  goalWingGenotype: WingGenotype;
  goalTailGenotype: TailGenotype;
}

export const initialGameState: GameState = {
  phase: 'intro',
  birds: [],
  selectedParent1Id: null,
  selectedParent2Id: null,
  lastBreedingResult: null,
  stepsRemaining: 3,
  goalWingGenotype: 'WW',
  goalTailGenotype: 'TT',
};
