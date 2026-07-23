import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ScoreService } from './services/score.service';
import { ScorecardComponent } from './scorecard/scorecard.component';
import { ExpansionSelectorComponent } from './scorecard/expansion-selector.component';

@Component({
  selector: 'app-root',
  imports: [FormsModule, ScorecardComponent, ExpansionSelectorComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly scoreService = inject(ScoreService);
  protected readonly players = this.scoreService.players;
  protected readonly hasPlayers = computed(() => this.players().length > 0);

  protected newPlayerName = signal('');
  protected showResetConfirm = signal(false);
  protected showClearConfirm = signal(false);

  protected addPlayer(): void {
    this.scoreService.addPlayer(this.newPlayerName());
    this.newPlayerName.set('');
  }

  protected removePlayer(id: string): void {
    this.scoreService.removePlayer(id);
  }

  protected resetScores(): void {
    this.scoreService.resetScores();
    this.showResetConfirm.set(false);
  }

  protected clearAll(): void {
    this.scoreService.clearAll();
    this.showClearConfirm.set(false);
  }

  protected onNameKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') this.addPlayer();
  }

  protected canAddPlayer = computed(() => this.players().length < 5);
}
