import { Injectable, signal, computed } from '@angular/core';
import { Player, PlayerScore, createDefaultScore, calculateTotal } from '../models/player.model';
import { EXPANSIONS } from '../models/expansion.model';

const STORAGE_KEY = 'wingspan_scorecard_v1';
const EXPANSIONS_STORAGE_KEY = 'wingspan_expansions_v1';
const TOTAL_ROUNDS = 4;

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
    field: keyof Omit<PlayerScore, 'endOfRoundGoals'>,
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

  updateTotalEndOfRoundGoals(playerId: string, total: number): void {
    const validTotal = Math.max(0, total);
    // Distribute equally across rounds, with remainder points going to later rounds
    const perRound = Math.floor(validTotal / TOTAL_ROUNDS);
    const remainder = validTotal % TOTAL_ROUNDS;
    const goals: [number, number, number, number] = [
      perRound,
      perRound + (remainder > 2 ? 1 : 0),
      perRound + (remainder > 1 ? 1 : 0),
      perRound + (remainder > 0 ? 1 : 0),
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
      return Array.isArray(parsed) ? parsed.filter(p => p?.id && p?.name && p?.score) : [];
    } catch {
      return [];
    }
  }

  private loadExpansionsFromStorage(): string[] {
    try {
      const raw = localStorage.getItem(EXPANSIONS_STORAGE_KEY);
      if (!raw) {
        // Default: all expansions selected
        return EXPANSIONS.map(e => e.id);
      }
      const parsed = JSON.parse(raw) as string[];
      return Array.isArray(parsed) ? parsed : EXPANSIONS.map(e => e.id);
    } catch {
      return EXPANSIONS.map(e => e.id);
    }
  }
}
