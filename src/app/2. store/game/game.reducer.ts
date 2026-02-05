import { createReducer, on } from '@ngrx/store';
import { produce } from 'immer';
import { GameState, initialGameState } from './game.state';
import * as GameActions from './game.actions';
import { isGoalBird } from '../../3. shared/genetics';

export const gameReducer = createReducer(
  initialGameState,

  // startGame transitions to 'starting' phase while effects validate the game
  on(GameActions.startGame, (state) =>
    produce(state, (draft) => {
      draft.phase = 'starting';
      draft.gameMode = 'standard';
    })
  ),

  on(GameActions.gameInitialized, (state, { birds, goalGenotypes, activeTraitSetId }) =>
    produce(state, (draft) => {
      draft.phase = 'deck';
      draft.birds = birds;
      draft.selectedParent1Id = null;
      draft.selectedParent2Id = null;
      draft.lastBreedingResult = null;
      draft.breedCount = 0;
      draft.goalGenotypes = goalGenotypes;
      draft.activeTraitSetId = activeTraitSetId;
      draft.gameMode = 'standard';
    })
  ),

  // Challenge mode: start game
  on(GameActions.startChallengeGame, (state) =>
    produce(state, (draft) => {
      draft.phase = 'starting';
      draft.gameMode = 'challenge';
    })
  ),

  // Challenge mode: game initialized
  // Preserves score/round if already in challenge mode (continuing to next round)
  on(GameActions.challengeGameInitialized, (state, { birds, goalGenotypes, activeTraitSetId }) =>
    produce(state, (draft) => {
      const isNewGame = state.gameMode !== 'challenge' || state.phase === 'intro' || state.phase === 'lose';

      draft.phase = 'deck';
      draft.birds = birds;
      draft.selectedParent1Id = null;
      draft.selectedParent2Id = null;
      draft.lastBreedingResult = null;
      draft.breedCount = 0;
      draft.goalGenotypes = goalGenotypes;
      draft.activeTraitSetId = activeTraitSetId;
      draft.gameMode = 'challenge';

      if (isNewGame) {
        // Starting fresh challenge
        draft.challengeScore = 0;
        draft.challengeRound = 1;
      }
      // Otherwise preserve existing score/round from previous round
      draft.breedsRemainingInRound = 4;
    })
  ),

  on(GameActions.selectParent1, (state, { birdId }) => {
    if (birdId === state.selectedParent2Id) {
      return state;
    }
    return produce(state, (draft) => {
      draft.selectedParent1Id = birdId;
    });
  }),

  on(GameActions.selectParent2, (state, { birdId }) => {
    if (birdId === state.selectedParent1Id) {
      return state;
    }
    return produce(state, (draft) => {
      draft.selectedParent2Id = birdId;
    });
  }),

  on(GameActions.clearParentSelection, (state) =>
    produce(state, (draft) => {
      draft.selectedParent1Id = null;
      draft.selectedParent2Id = null;
    })
  ),

  // confirmBreeding is handled by effects, which dispatches breedingComplete
  on(GameActions.confirmBreeding, (state) => state),

  on(GameActions.breedingComplete, (state, { result }) =>
    produce(state, (draft) => {
      draft.phase = 'result';
      draft.lastBreedingResult = result;
    })
  ),

  on(GameActions.continueFromResult, (state) => {
    if (!state.lastBreedingResult) {
      return state;
    }

    const offspring = state.lastBreedingResult.offspring;
    const winningOffspring = offspring.find((o) => isGoalBird(o, state.goalGenotypes));

    // Challenge mode logic
    if (state.gameMode === 'challenge') {
      return produce(state, (draft) => {
        draft.birds.push(...offspring);
        draft.breedCount += 1;
        draft.selectedParent1Id = null;
        draft.selectedParent2Id = null;

        if (winningOffspring) {
          // Goal reached! Award points and advance round
          const pointsEarned = draft.breedsRemainingInRound * 100;
          draft.challengeScore += pointsEarned;
          draft.challengeRound += 1;
          draft.breedsRemainingInRound = 4;
          draft.phase = 'win';
        } else {
          // Decrement breeds remaining
          draft.breedsRemainingInRound -= 1;
          if (draft.breedsRemainingInRound <= 0) {
            // Out of breeds - game over
            draft.phase = 'lose';
          } else {
            draft.phase = 'deck';
          }
        }
      });
    }

    // Standard mode logic
    return produce(state, (draft) => {
      draft.birds.push(...offspring);
      draft.breedCount += 1;
      draft.selectedParent1Id = null;
      draft.selectedParent2Id = null;

      if (winningOffspring) {
        draft.phase = 'win';
      } else {
        draft.phase = 'deck';
      }
    });
  }),

  // Challenge mode: round complete (triggered from win screen)
  on(GameActions.challengeRoundComplete, (state, { pointsEarned }) =>
    produce(state, (draft) => {
      draft.challengeScore += pointsEarned;
      draft.challengeRound += 1;
      draft.breedsRemainingInRound = 4;
      draft.phase = 'starting';
    })
  ),

  // Challenge mode: game over
  on(GameActions.challengeGameOver, (state) =>
    produce(state, (draft) => {
      draft.phase = 'lose';
    })
  ),

  on(GameActions.resetGame, () => initialGameState),

  on(GameActions.showTutorial, (state) =>
    produce(state, (draft) => {
      draft.phase = 'tutorial';
    })
  ),

  on(GameActions.backToIntro, (state) =>
    produce(state, (draft) => {
      draft.phase = 'intro';
    })
  )
);
