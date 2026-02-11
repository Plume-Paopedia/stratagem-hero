import { create } from 'zustand';
import type { Faction } from '../types/factions';
import { getRandomFaction } from '../types/factions';

interface FactionState {
  activeFaction: Faction | null;
  setFaction: (f: Faction | null) => void;
  randomizeFaction: () => void;
}

export const useFactionStore = create<FactionState>((set) => ({
  activeFaction: null,
  setFaction: (f) => set({ activeFaction: f }),
  randomizeFaction: () => set({ activeFaction: getRandomFaction() }),
}));
