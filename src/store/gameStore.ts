import { create } from 'zustand';

interface GameState {
  running: boolean;
  completed: boolean;
  elapsed: number;
  baseMs: number;
  lastStartAt: number | null;
  start: () => void;
  pause: () => void;
  reset: () => void;
  setCompleted: (completed: boolean) => void;
  setElapsed: (elapsed: number) => void;
  setBaseMs: (baseMs: number) => void;
  setLastStartAt: (lastStartAt: number | null) => void;
  updateElapsed: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  running: false,
  completed: false,
  elapsed: 0,
  baseMs: 0,
  lastStartAt: null,
  start: () => {
    const now = Date.now();
    set({ running: true, lastStartAt: now });
  },
  pause: () => {
    const { running, lastStartAt, baseMs } = get();
    if (running && lastStartAt) {
      const now = Date.now();
      const newBaseMs = baseMs + (now - lastStartAt);
      set({ running: false, baseMs: newBaseMs, lastStartAt: null });
    }
  },
  reset: () => set({ 
    running: false, 
    completed: false, 
    elapsed: 0, 
    baseMs: 0, 
    lastStartAt: null 
  }),
  setCompleted: (completed: boolean) => {
    const { running, lastStartAt, baseMs } = get();
    if (completed && running && lastStartAt) {
      const now = Date.now();
      const finalMs = baseMs + (now - lastStartAt);
      set({ completed, running: false, baseMs: finalMs, lastStartAt: null });
    } else {
      set({ completed });
    }
  },
  setElapsed: (elapsed: number) => set({ elapsed }),
  setBaseMs: (baseMs: number) => set({ baseMs }),
  setLastStartAt: (lastStartAt: number | null) => set({ lastStartAt }),
  updateElapsed: () => {
    const { running, baseMs, lastStartAt } = get();
    if (running && lastStartAt) {
      const now = Date.now();
      const ms = baseMs + (now - lastStartAt);
      set({ elapsed: Math.floor(ms / 1000) });
    } else if (!running) {
      set({ elapsed: Math.floor(baseMs / 1000) });
    }
  },
}));
