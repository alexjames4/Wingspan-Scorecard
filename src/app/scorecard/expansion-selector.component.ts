import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScoreService } from '../services/score.service';
import { EXPANSIONS } from '../models/expansion.model';

@Component({
  selector: 'app-expansion-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './expansion-selector.component.html',
  styleUrl: './expansion-selector.component.scss',
})
export class ExpansionSelectorComponent {
  protected readonly scoreService = inject(ScoreService);
  protected readonly expansions = EXPANSIONS;

  protected toggleExpansion(expansionId: string): void {
    this.scoreService.toggleExpansion(expansionId);
  }

  protected isSelected(expansionId: string): boolean {
    return this.scoreService.selectedExpansions().includes(expansionId);
  }
}
