import { Injectable, signal, computed } from '@angular/core';
import {
  NectarScores,
  NectarCompetitionPoints,
  Player,
  PlayerScore,
  ScoreField,
  createDefaultScore,
  createEmptyNectarCompetitionPoints,
  calculateTotal,
} from '../models/player.model';
import { EXPANSIONS } from '../models/expansion.model';

const STORAGE_KEY = 'wingspan_scorecard_v1';
const EXPANSIONS_STORAGE_KEY = 'wingspan_expansions_v1';
const TOTAL_ROUNDS = 4;
const TOTAL_NECTAR_HABITATS = 3;

@Injectable({ providedIn: 'root' })
export class ScoreService {
  private readonly _players = signal<Player[]>(this.loadFromStorage());
  private readonly _selectedExpansions = signal<string[]>(this.loadExpansionsFromStorage());

  readonly players = this._players.asReadonly();
  readonly selectedExpansions = this._selectedExpansions.asReadonly();

  readonly sortedPlayers = computed(() =>
    [...this._players()].sort((a, b) => {
      const diff = this.getTotal(b.score) - this.getTotal(a.score);
      return diff !== 0 ? diff : b.score.unusedFood - a.score.unusedFood;
    })
  );

  addPlayer(name: string): boolean {
    if (this._players().length >= 5) return false;
    const trimmed = name.trim();
    this._players.update(ps => [
      ...ps,
      {
        id: crypto.randomUUID(),
        name: trimmed || `Player ${ps.length + 1}`,
        score: createDefaultScore(),
      },
    ]);
    this.save();
    return true;
  }

  removePlayer(id: string): void {
    this._players.update(ps => ps.filter(p => p.id !== id));
    this.save();
  }

  renamePlayer(id: string, name: string): void {
    this._players.update(ps =>
      ps.map(p => (p.id === id ? { ...p, name: name.trim() || p.name } : p))
    );
    this.save();
  }

  updateScore(
    playerId: string,
    field: ScoreField,
    value: number
  ): void {
    this._players.update(ps =>
      ps.map(p =>
        p.id === playerId
          ? { ...p, score: { ...p.score, [field]: Math.max(0, value) } }
          : p
      )
    );
    this.save();
  }

  updateNectarScore(playerId: string, habitatIndex: number, value: number): void {
    if (habitatIndex < 0 || habitatIndex >= TOTAL_NECTAR_HABITATS) return;

    this._players.update(ps =>
      ps.map(p => {
        if (p.id !== playerId) return p;
        const nectar = [...p.score.nectar] as NectarScores;
        nectar[habitatIndex] = Math.max(0, value);
        return { ...p, score: { ...p.score, nectar } };
      })
    );

    // Recalculate nectar competition points for all players
    this._calculateAndUpdateNectarCompetitionPoints();
    this.save();
  }

  updateTotalEndOfRoundGoals(playerId: string, total: number): void {
    const validTotal = Math.max(0, total);
    // Distribute equally across rounds, with remainder points going to first rounds
    const perRound = Math.floor(validTotal / TOTAL_ROUNDS);
    const remainder = validTotal % TOTAL_ROUNDS;
    const goals: [number, number, number, number] = [
      perRound + (remainder >= 1 ? 1 : 0),
      perRound + (remainder >= 2 ? 1 : 0),
      perRound + (remainder >= 3 ? 1 : 0),
      perRound,
    ];
    this._players.update(ps =>
      ps.map(p => {
        if (p.id !== playerId) return p;
        return { ...p, score: { ...p.score, endOfRoundGoals: goals } };
      })
    );
    this.save();
  }

  updateRoundGoal(playerId: string, roundIndex: number, value: number): void {
    this._players.update(ps =>
      ps.map(p => {
        if (p.id !== playerId) return p;
        const goals = [...p.score.endOfRoundGoals] as [number, number, number, number];
        goals[roundIndex] = Math.max(0, value);
        return { ...p, score: { ...p.score, endOfRoundGoals: goals } };
      })
    );
    this.save();
  }

  getTotal(score: PlayerScore): number {
    return calculateTotal(score);
  }

  resetScores(): void {
    this._players.update(ps => ps.map(p => ({ ...p, score: createDefaultScore() })));
    this.save();
  }

  clearAll(): void {
    this._players.set([]);
    this.save();
  }

  toggleExpansion(expansionId: string): void {
    this._selectedExpansions.update(current =>
      current.includes(expansionId)
        ? current.filter(id => id !== expansionId)
        : [...current, expansionId]
    );
    this.saveExpansions();
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._players()));
    } catch { /* storage quota */ }
  }

  private _calculateAndUpdateNectarCompetitionPoints(): void {
    this._players.update(ps => {
      // For each habitat, calculate points
      const habitatPoints: NectarCompetitionPoints[] = ps.map(() => createEmptyNectarCompetitionPoints());

      for (let habitatIndex = 0; habitatIndex < TOTAL_NECTAR_HABITATS; habitatIndex++) {
        // Get all players with their nectar values for this habitat
        const habitatScores = ps.map((p, pIndex) => ({
          playerIndex: pIndex,
          nectarValue: p.score.nectar[habitatIndex],
        }));

        // Sort by nectar value descending
        habitatScores.sort((a, b) => b.nectarValue - a.nectarValue);

        // Award points based on ranking
        let currentRank = 1;
        let i = 0;

        while (i < habitatScores.length) {
          const currentValue = habitatScores[i].nectarValue;

          // Skip if no nectar in this habitat
          if (currentValue === 0) {
            break;
          }

          // Find all players with the same nectar value (tied)
          const tiedPlayers: typeof habitatScores = [];
          let j = i;
          while (j < habitatScores.length && habitatScores[j].nectarValue === currentValue) {
            tiedPlayers.push(habitatScores[j]);
            j++;
          }

          // Award points based on position and number of ties
          const points = this._calculateTiePoints(currentRank, tiedPlayers.length);

          for (const player of tiedPlayers) {
            habitatPoints[player.playerIndex][habitatIndex] = points;
          }

          currentRank += tiedPlayers.length;
          i = j;
        }
      }

      // Update all players with their competition points
      return ps.map((p, index) => ({
        ...p,
        score: { ...p.score, nectarCompetitionPoints: habitatPoints[index] },
      }));
    });
  }

  private _calculateTiePoints(rank: number, tiedCount: number): number {
    if (rank === 1) {
      // Joint 1st place
      return tiedCount > 1 ? 3 : 5;
    } else if (rank === 2) {
      // Joint 2nd place
      return tiedCount > 1 ? 1 : 2;
    } else {
      // 3rd place or lower
      return 0;
    }
  }

  private saveExpansions(): void {
    try {
      localStorage.setItem(EXPANSIONS_STORAGE_KEY, JSON.stringify(this._selectedExpansions()));
    } catch { /* storage quota */ }
  }

  private loadFromStorage(): Player[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as Player[];
      return Array.isArray(parsed)
        ? parsed
            .filter(p => p?.id && p?.name && p?.score)
            .map(player => this.normalizePlayer(player))
        : [];
    } catch {
      return [];
    }
  }

  private normalizePlayer(player: Player): Player {
    const defaultScore = createDefaultScore();
    const rawGoals = Array.isArray(player.score.endOfRoundGoals)
      ? player.score.endOfRoundGoals
      : defaultScore.endOfRoundGoals;
    const rawNectar = Array.isArray(player.score.nectar) ? player.score.nectar : defaultScore.nectar;
    const rawNectarCompetitionPoints = Array.isArray(player.score.nectarCompetitionPoints)
      ? player.score.nectarCompetitionPoints
      : defaultScore.nectarCompetitionPoints;

    return {
      ...player,
      score: {
        ...defaultScore,
        ...player.score,
        endOfRoundGoals: Array.from({ length: TOTAL_ROUNDS }, (_, index) => rawGoals[index] ?? 0) as [
          number,
          number,
          number,
          number,
        ],
        nectar: Array.from(
          { length: TOTAL_NECTAR_HABITATS },
          (_, index) => rawNectar[index] ?? 0
        ) as NectarScores,
        nectarCompetitionPoints: Array.from(
          { length: TOTAL_NECTAR_HABITATS },
          (_, index) => rawNectarCompetitionPoints[index] ?? 0
        ) as NectarCompetitionPoints,
      },
    };
  }

  private loadExpansionsFromStorage(): string[] {
    try {
      const raw = localStorage.getItem(EXPANSIONS_STORAGE_KEY);
      if (!raw) {
        // Default: all expansions selected
        return EXPANSIONS.map(e => e.id);
      }
      const parsed = JSON.parse(raw) as string[];
      const validIds = EXPANSIONS.map(e => e.id);
      
      // Migration map for old IDs to new IDs (null = removed)
      const migrationMap: Record<string, string | null> = {
        'base': null,
        'european': null,
        'oceania': 'nectar',
        'asia': 'duet',
        'americas': 'hummingbirds',
      };
      
      // Track if any removed expansions were present
      const hadRemovedExpansions = parsed.some(id => migrationMap[id] === null);
      
      // Migrate old IDs to new ones for backward compatibility
      const migrated = parsed.map(id => migrationMap[id] ?? id);
      
      // Filter out null values and invalid IDs
      const filtered = migrated.filter((id): id is string => id !== null && validIds.includes(id));
      
      // If all saved expansions were removed, fall back to defaults
      // Otherwise preserve the user's selection (even if empty)
      return filtered.length === 0 && hadRemovedExpansions ? EXPANSIONS.map(e => e.id) : filtered;
    } catch {
      return EXPANSIONS.map(e => e.id);
    }
  }
}
