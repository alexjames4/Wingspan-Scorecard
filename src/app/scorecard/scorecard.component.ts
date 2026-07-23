import { Component, inject } from '@angular/core';
import { ScoreService } from '../services/score.service';
import { Player, PlayerScore } from '../models/player.model';

@Component({
  selector: 'app-scorecard',
  imports: [],
  templateUrl: './scorecard.component.html',
  styleUrl: './scorecard.component.scss',
})
export class ScorecardComponent {
  protected readonly scoreService = inject(ScoreService);
  protected readonly players = this.scoreService.players;
  protected readonly rounds = [0, 1, 2, 3] as const;

  protected getTotal(player: Player): number {
    return this.scoreService.getTotal(player.score);
  }

  protected isLeading(player: Player): boolean {
    const ps = this.players();
    if (ps.length === 0) return false;
    const maxTotal = Math.max(...ps.map(p => this.scoreService.getTotal(p.score)));
    const myTotal = this.getTotal(player);
    if (myTotal !== maxTotal) return false;
    const topPlayers = ps.filter(p => this.scoreService.getTotal(p.score) === maxTotal);
    if (topPlayers.length === 1) return true;
    const maxUnused = Math.max(...topPlayers.map(p => p.score.unusedFood));
    return player.score.unusedFood === maxUnused;
  }

  protected getTotalEndOfRoundGoals(player: Player): number {
    return player.score.endOfRoundGoals.reduce((sum, val) => sum + val, 0);
  }

  protected onInput(
    playerId: string,
    field: keyof Omit<PlayerScore, 'endOfRoundGoals'>,
    event: Event
  ): void {
    const value = +(event.target as HTMLInputElement).value || 0;
    this.scoreService.updateScore(playerId, field, value);
  }

  protected onEndOfRoundGoalsInput(playerId: string, event: Event): void {
    const total = +(event.target as HTMLInputElement).value || 0;
    this.scoreService.updateTotalEndOfRoundGoals(playerId, total);
  }
}
