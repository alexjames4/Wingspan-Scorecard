# Development Guidelines for Wingspan Scorecard

## General Principles

**Do not make assumptions, ask for clarification.**

When in doubt about design decisions, placement, styling, or functionality, ask the user for clarification before implementing.

## Player Management

### Player Colors

Player pills display bird icons with auto-assigned colors that help visually distinguish between players:
- **Yellow** - First player
- **Lime/Green** - Second player
- **Red** - Third player
- **Cyan** - Fourth player
- **Magenta** - Fifth player

Each player can click on their bird icon to open a color picker and select a different color. The color selection is persisted in localStorage.

## Pull Request Workflow

**All implementation tasks must conclude with a Pull Request.**

After completing implementation of any feature or fix in a session:
1. Ensure all code changes are committed
2. Create a Pull Request for review
3. Include a clear description of changes made
4. Link to any related issues or requirements

This ensures code review and maintains a clear history of all changes in the repository.

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
- The Nectar row contains 3 separate editable entries (one for each habitat: Forest, Grassland, Wetland)
- Users can enter nectar values for each habitat

**Nectar Competition Scoring:**
- Each habitat is its own competition among all players
- Players are ranked by their nectar value in each habitat
- Scoring is based on ranking:
  - 1st place: 5 points
  - 2nd place: 2 points
  - 3rd place or lower: 0 points
- In case of a tie (draw):
  - Joint 1st place: 3 points each
  - Joint 2nd place: 1 point each
- The read-only score displays the competition points for each habitat and the total (e.g., "5 + 2 + 0 = 7")
- The read-only score is displayed as text, not an input box
- The total nectar competition points are included in the overall total points scoring calculation

### Asia Expansion - Duet Group Row

When the Asia Expansion is selected:
- A "Duet Group" row is added to the scorecard
- Users can enter the Duet Group point value for each player
- This value is included in the overall total points scoring calculation

### Americas Expansion - Hummingbirds Row

When the Americas Expansion is selected:
- A "Hummingbirds" row is added to the scorecard
- Users can enter the Hummingbirds point value for each player
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
