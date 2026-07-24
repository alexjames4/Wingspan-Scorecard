import { TestBed } from '@angular/core/testing';
import { ScoreService } from '../services/score.service';
import { ScorecardComponent } from './scorecard.component';

const EXPANSIONS_STORAGE_KEY = 'wingspan_expansions_v1';

function setInputValue(input: HTMLInputElement, value: number): void {
  input.value = String(value);
  input.dispatchEvent(new Event('input'));
}

describe('ScorecardComponent', () => {
  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [ScorecardComponent],
    }).compileComponents();
  });

  it('shows the nectar row only when Oceania expansion is selected', () => {
    localStorage.setItem(EXPANSIONS_STORAGE_KEY, JSON.stringify(['base']));

    const scoreService = TestBed.inject(ScoreService);
    scoreService.addPlayer('Alice');

    const fixture = TestBed.createComponent(ScorecardComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).not.toContain('Nectar');

    scoreService.toggleExpansion('oceania');
    fixture.detectChanges();

    expect(compiled.textContent).toContain('Nectar');
  });

  it('updates nectar totals and includes them in the grand total', () => {
    localStorage.setItem(EXPANSIONS_STORAGE_KEY, JSON.stringify(['base', 'oceania']));

    const scoreService = TestBed.inject(ScoreService);
    scoreService.addPlayer('Alice');

    const fixture = TestBed.createComponent(ScorecardComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const birdPointsInput = compiled.querySelector(
      'input[aria-label="Bird points for Alice"]'
    ) as HTMLInputElement;
    const forestInput = compiled.querySelector(
      'input[aria-label="Forest nectar for Alice"]'
    ) as HTMLInputElement;
    const grasslandInput = compiled.querySelector(
      'input[aria-label="Grassland nectar for Alice"]'
    ) as HTMLInputElement;
    const wetlandInput = compiled.querySelector(
      'input[aria-label="Wetland nectar for Alice"]'
    ) as HTMLInputElement;
    const nectarScoreDisplay = compiled.querySelector('.nectar-score-text');

    setInputValue(birdPointsInput, 4);
    setInputValue(forestInput, 1);
    setInputValue(grasslandInput, 2);
    setInputValue(wetlandInput, 3);
    fixture.detectChanges();

    expect(nectarScoreDisplay?.textContent).toContain('5 + 5 + 5 = 15');
    expect(compiled.querySelector('.total-row .total-cell strong')?.textContent?.trim()).toBe('19');
  });
});
