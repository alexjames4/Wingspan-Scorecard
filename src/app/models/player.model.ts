export type NectarScores = [number, number, number];

export interface PlayerScore {
  birdPoints: number;
  bonusCards: number;
  endOfRoundGoals: [number, number, number, number];
  eggs: number;
  cachedFood: number;
  tuckedCards: number;
  nectar: NectarScores;
  duetGroup: number;
  unusedFood: number;
}

export type ScoreField = keyof Omit<PlayerScore, 'endOfRoundGoals' | 'nectar'>;

export interface Player {
  id: string;
  name: string;
  score: PlayerScore;
}

export function createDefaultScore(): PlayerScore {
  return {
    birdPoints: 0,
    bonusCards: 0,
    endOfRoundGoals: [0, 0, 0, 0],
    eggs: 0,
    cachedFood: 0,
    tuckedCards: 0,
    nectar: [0, 0, 0],
    duetGroup: 0,
    unusedFood: 0,
  };
}

export function calculateNectarTotal(score: PlayerScore): number {
  return score.nectar.reduce((a, b) => a + b, 0);
}

export function calculateTotal(score: PlayerScore): number {
  return (
    score.birdPoints +
    score.bonusCards +
    score.endOfRoundGoals.reduce((a, b) => a + b, 0) +
    score.eggs +
    score.cachedFood +
    score.tuckedCards +
    calculateNectarTotal(score) +
    score.duetGroup
  );
}
