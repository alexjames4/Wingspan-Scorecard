# Development Guidelines for Wingspan Scorecard

## General Principles

**Do not make assumptions, ask for clarification.**

When in doubt about design decisions, placement, styling, or functionality, ask the user for clarification before implementing.

## Expansions

### Available Expansions

The app supports multiple Wingspan expansions that users can select from:
- Base game
- European Expansion
- Oceania Expansion
- Asia Expansion
- Americas Expansion

### Expansion Selection

- Users can select multiple expansions via checkboxes in a flexbox layout
- All expansions should be selected by default
- The selection is stored in localStorage and persists across sessions
- Future PRs will handle how selections affect the scorecard content

### Oceania Expansion - Nectar Row

When the Oceania Expansion is selected:
- A "Nectar" row is added to the scorecard
- Instead of a single cell entry, the Nectar row contains 3 separate entries (one for each habitat)
- The individual habitat entries allow users to enter nectar values for each habitat
- A read-only total cell displays the sum of the three habitat nectar values
- This total is used in the overall total points scoring calculation

### Asia Expansion - Duet Group Row

When the Asia Expansion is selected:
- A "Duet Group" row is added to the scorecard
- Users can enter the Duet Group point value for each player
- This value is included in the overall total points scoring calculation

## Styling & Theming

### Current Theme

- Styling matches the overall app theme (cards, buttons, etc.)
- Mobile-first approach (primarily used on mobile)

### Future Theming

In future iterations, the user would like to implement theme selections (e.g., dark mode). Any styling should be designed with this in mind and avoid hardcoding colors where possible.

## Architecture

- Project uses Angular v21 with standalone components
- Uses signals and @if/@for control flow syntax
- SCSS for styles
- Deployed to GitHub Pages via GitHub Actions

## Commits & Code Changes

- Avoid touching non-essential files
- Make only targeted code changes when requested
- Keep changes minimal and focused on the task at hand
