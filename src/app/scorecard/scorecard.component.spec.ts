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

    setInputValue(birdPointsInput, 4);
    setInputValue(forestInput, 1);
    setInputValue(grasslandInput, 2);
    setInputValue(wetlandInput, 3);
    fixture.detectChanges();

    const nectarScoreDisplay = compiled.querySelector('.nectar-score-text') as HTMLElement;
    expect(nectarScoreDisplay).toBeTruthy();
    expect(nectarScoreDisplay?.textContent).toContain('5 + 5 + 5 = 15');
    expect(compiled.querySelector('.total-row .total-cell strong')?.textContent?.trim()).toBe('19');
  });

  it('awards correct points for tied 1st place and 2nd place in nectar competitions', () => {
    localStorage.setItem(EXPANSIONS_STORAGE_KEY, JSON.stringify(['base', 'oceania']));

    const scoreService = TestBed.inject(ScoreService);
    scoreService.addPlayer('Alice');
    scoreService.addPlayer('Bob');
    scoreService.addPlayer('Charlie');

    const players = scoreService.players();
    const alice = players[0];
    const bob = players[1];
    const charlie = players[2];

    // Set up nectar values for Forest habitat: Alice=5, Bob=5 (tied 1st), Charlie=3 (rank 3)
    scoreService.updateNectarScore(alice.id, 0, 5);
    scoreService.updateNectarScore(bob.id, 0, 5);
    scoreService.updateNectarScore(charlie.id, 0, 3);

    // Set up nectar values for Grassland habitat: Charlie=10 (1st), Alice=0, Bob=0
    scoreService.updateNectarScore(alice.id, 1, 0);
    scoreService.updateNectarScore(bob.id, 1, 0);
    scoreService.updateNectarScore(charlie.id, 1, 10);

    const fixture = TestBed.createComponent(ScorecardComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    // Get nectar score displays by their corresponding players
    const aliceNectarDisplay = compiled.querySelector(
      'input[aria-label="Forest nectar for Alice"]'
    )?.closest('.nectar-cell')?.querySelector('.nectar-score-text') as HTMLElement;

    const bobNectarDisplay = compiled.querySelector(
      'input[aria-label="Forest nectar for Bob"]'
    )?.closest('.nectar-cell')?.querySelector('.nectar-score-text') as HTMLElement;

    const charlieNectarDisplay = compiled.querySelector(
      'input[aria-label="Forest nectar for Charlie"]'
    )?.closest('.nectar-cell')?.querySelector('.nectar-score-text') as HTMLElement;

    // Alice: Forest 3 (tied 1st) + Grassland 0 (no nectar) + Wetland 0 = 3
    expect(aliceNectarDisplay?.textContent).toContain('3 + 0 + 0 = 3');

    // Bob: Forest 3 (tied 1st) + Grassland 0 (no nectar) + Wetland 0 = 3
    expect(bobNectarDisplay?.textContent).toContain('3 + 0 + 0 = 3');

    // Charlie: Forest 0 (rank 3, no points) + Grassland 5 (1st place) + Wetland 0 = 5
    expect(charlieNectarDisplay?.textContent).toContain('0 + 5 + 0 = 5');
  });
});
