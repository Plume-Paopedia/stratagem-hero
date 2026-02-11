export type Faction = 'terminids' | 'automatons' | 'illuminate';

export interface FactionTheme {
  id: Faction;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    glow: string;
    bgGradient: string;
  };
  particleHues: number[];
  tagline: string;
}

export const FACTIONS: Record<Faction, FactionTheme> = {
  terminids: {
    id: 'terminids',
    name: 'Terminids',
    colors: {
      primary: '#f5a623',
      secondary: '#8b6914',
      accent: '#39ff14',
      glow: 'rgba(245,166,35,0.5)',
      bgGradient: 'radial-gradient(ellipse at center, rgba(245,166,35,0.06) 0%, transparent 70%)',
    },
    particleHues: [40, 50, 120],
    tagline: 'ECRASEZ LES INSECTES',
  },
  automatons: {
    id: 'automatons',
    name: 'Automatons',
    colors: {
      primary: '#ff2222',
      secondary: '#8b1a1a',
      accent: '#ff6600',
      glow: 'rgba(255,34,34,0.5)',
      bgGradient: 'radial-gradient(ellipse at center, rgba(255,34,34,0.06) 0%, transparent 70%)',
    },
    particleHues: [0, 15, 30],
    tagline: 'BROYEZ LES ROBOTS',
  },
  illuminate: {
    id: 'illuminate',
    name: 'Illuminate',
    colors: {
      primary: '#8b5cf6',
      secondary: '#3b0a8b',
      accent: '#06b6d4',
      glow: 'rgba(139,92,246,0.5)',
      bgGradient: 'radial-gradient(ellipse at center, rgba(139,92,246,0.06) 0%, transparent 70%)',
    },
    particleHues: [270, 280, 190],
    tagline: 'PURGEZ LES CALMARS',
  },
};

const FACTION_LIST: Faction[] = ['terminids', 'automatons', 'illuminate'];

export function getRandomFaction(): Faction {
  return FACTION_LIST[Math.floor(Math.random() * FACTION_LIST.length)];
}
