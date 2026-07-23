export interface Expansion {
  id: string;
  label: string;
}

export const EXPANSIONS: Expansion[] = [
  { id: 'base', label: 'Base game' },
  { id: 'european', label: 'European Expansion' },
  { id: 'oceania', label: 'Oceania Expansion' },
  { id: 'asia', label: 'Asia Expansion' },
  { id: 'americas', label: 'Americas Expansion' },
];
