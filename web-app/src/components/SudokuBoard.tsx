"use client";

import { useEffect, useMemo, useState, Fragment } from "react";
import { motion } from "@/lib/motion";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import type { Grid, getTip as getTipFn } from "@/utils/sudoku";
import { getTip as computeTip } from "@/utils/sudoku";
import { useGameStore } from "@/store/gameStore";

type Props = {
  initial: Grid;
  solution: Grid;
  onComplete?: (stats: { mistakes: number; timeSeconds: number }) => void;
};

export default function SudokuBoard({ initial, solution, onComplete }: Props) {
  const {
    running,
    completed,
    elapsed,
    baseMs,
    lastStartAt,
    start,
    pause,
    reset,
    setCompleted,
    setElapsed,
    setBaseMs,
    setLastStartAt,
    updateElapsed,
  } = useGameStore();

  const [grid, setGrid] = useState<Grid>(() => initial.map((r) => r.slice()));
  const [selected, setSelected] = useState<[number, number] | null>(null);
  // Track total mistakes made (not just current mistakes)
  const [mistakeCount, setMistakeCount] = useState(0);
  const [tip, setTip] = useState<ReturnType<typeof computeTip> | null>(null);
  const [pencilMode, setPencilMode] = useState(false);
  // notes[r][c] is a Set of candidate digits 1-9
  const [notes, setNotes] = useState<Set<number>[][]>(() =>
    Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => new Set<number>()))
  );

  // Digit highlighting feature
  const [highlightDigit, setHighlightDigit] = useState<number | null>(null);

  useEffect(() => {
    setGrid(initial.map((r) => r.slice()));
    setSelected(null);
    setTip(null);
    setMistakeCount(0);
    // reset timer state
    setElapsed(0);
    setBaseMs(0);
    setLastStartAt(null);
    setNotes(Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => new Set<number>())));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]);

  const isGiven = useMemo(() => {
    const given = new Set<string>();
    initial.forEach((row, r) =>
      row.forEach((v, c) => {
        if (v !== 0) given.add(`${r},${c}`);
      })
    );
    return (r: number, c: number) => given.has(`${r},${c}`);
  }, [initial]);

  useEffect(() => {
    // completion check
    const done = grid.every((r, i) => r.every((v, j) => v === solution[i][j]));
    if (done && !completed) {
      const now = Date.now();
      const ms = baseMs + (running && lastStartAt ? now - lastStartAt : 0);
      const timeSeconds = Math.round(ms / 1000);
      // Count mistakes at completion
      onComplete?.({ mistakes: mistakeCount, timeSeconds });
      // auto stop on completion and mark as completed
      setCompleted(true);
    }
  }, [grid, solution, baseMs, running, lastStartAt, onComplete, completed, mistakeCount, setCompleted]);

  // timer
  useEffect(() => {
    if (!running) {
      updateElapsed();
      return;
    }
    const id = setInterval(() => {
      updateElapsed();
    }, 250);
    return () => clearInterval(id);
  }, [running, baseMs, lastStartAt, updateElapsed]);

  function startOrResume() {
    if (completed) return;
    start();
  }

  function pauseGame() {
    pause();
  }

  function resetTimer() {
    reset();
  }

  function handleInput(val: number) {
    if (!running) return;
    if (!selected) return;
    const [r, c] = selected;
    if (isGiven(r, c)) return;
  if (pencilMode && val !== 0) {
      // toggle note
      setNotes((old) => {
        const n = old.map((row) => row.map((s) => new Set(s)));
        if (n[r][c].has(val)) n[r][c].delete(val);
        else n[r][c].add(val);
        return n;
      });
  // Do not highlight for pencil input
  setHighlightDigit(null);
  return;
    }
  setGrid((g) => {
      const next = g.map((row) => row.slice());
      const prevVal = g[r][c];
      if (val === 0) next[r][c] = 0;
      else next[r][c] = val;
      // Only increment mistakeCount if this input is a new mistake
      if (
        val !== 0 &&
        val !== solution[r][c] &&
        prevVal !== val && // only if value actually changed
        solution[r][c] !== prevVal // only if previous value was not already a mistake
      ) {
        setMistakeCount((count) => count + 1);
      }
      // clear notes when value placed
      if (val !== 0) {
        setNotes((old) => {
          const n = old.map((row) => row.map((s) => new Set(s)));
          n[r][c].clear();
          return n;
        });
      }
  // If a true value is placed, update highlight digit
  if (val !== 0) setHighlightDigit(val);
  else setHighlightDigit(null);
  return next;
    });
  }

  function onTip() {
    if (!running) return;
    const t = computeTip(grid);
    setTip(t);
    if (t?.highlight?.cells?.[0]) setSelected(t.highlight.cells[0]);
  }

  // Handle cell click for digit highlighting
  function handleCellClick(r: number, c: number) {
    setSelected([r, c]);
    const val = grid[r][c];
    // Only highlight if cell has a true value (not 0, not pencil)
    if (val !== 0) {
      setHighlightDigit(val);
      console.log('Highlighting digit:', val);
    } else {
      setHighlightDigit(null);
      console.log('Clearing highlight');
    }
  }

  return (
    <div className="w-full flex flex-col gap-4">
  {/* Removed debug text for highlighting digit */}
  <div className="flex items-center justify-between gap-2 text-sm text-gray-700">
        <div>Mode: {pencilMode ? "Pencil" : "Number"}</div>
        <div className="flex items-center gap-2">
          <span className="tabular-nums">
            Time: {String(Math.floor(elapsed / 60)).padStart(2, "0")}:{String(elapsed % 60).padStart(2, "0")}
          </span>
          <div className="flex items-center gap-1">
            <Button size="sm" onClick={startOrResume} disabled={completed}>
              {running ? "Running" : elapsed > 0 ? "Resume" : "Start"}
            </Button>
            <Button size="sm" variant="outline" onClick={pauseGame} disabled={!running}>
              Pause
            </Button>
            <Button size="sm" variant="ghost" onClick={resetTimer} disabled={running && elapsed === 0}>
              Reset
            </Button>
          </div>
        </div>
      </div>
      <Card>
        <CardContent>
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-9 gap-[1px] bg-gray-400 p-[2px] max-w-[min(90vw,520px)] mx-auto"
          >
            {grid.map((row, r) => (
              <Fragment key={`row-${r}`}>
                {row.map((val, c) => {
                  const sel = selected && selected[0] === r && selected[1] === c;
                  const given = isGiven(r, c);
                  const tipHighlighted = tip?.highlight?.cells?.some(([rr, cc]) => rr === r && cc === c);
                  const isMistake = val !== 0 && val !== solution[r][c] && !given;
                  // Highlight if this cell's value matches the highlighted digit (and is a true value)
                  const isDigitHighlighted =
                    highlightDigit !== null && val === highlightDigit && val !== 0;
                  if (isDigitHighlighted) {
                    console.log(`Cell [${r},${c}] highlighted for digit`, highlightDigit);
                  }
                  return (
                    <motion.button
                      key={`${r}-${c}`}
                      onClick={() => handleCellClick(r, c)}
                      whileTap={{ scale: 0.96 }}
                      animate={sel ? { boxShadow: "0 0 0 2px rgba(99,102,241,0.8) inset" } : {}}
                      className={[
                        "relative aspect-square flex items-center justify-center text-lg select-none",
                        // grid lines
                        "border border-gray-200",
                        // thicker block borders
                        r % 3 === 0 && "border-t-4 border-t-gray-500",
                        c % 3 === 0 && "border-l-4 border-l-gray-500",
                        (r + 1) % 3 === 0 && "border-b-4 border-b-gray-500",
                        (c + 1) % 3 === 0 && "border-r-4 border-r-gray-500",
                        sel ? "bg-indigo-50" : tipHighlighted ? "bg-yellow-50" : "",
                        isMistake ? "bg-red-500 bg-opacity-80 text-white animate-pulse" : "bg-white",
                        given ? "text-gray-900 font-semibold" : "text-indigo-700",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      style={isDigitHighlighted ? { backgroundColor: '#22c55e' } : {}}
                    >
                      {val !== 0 ? (
                        val
                      ) : (
                        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 p-1 text-[10px] leading-none text-gray-500">
                          {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
                            <div key={n} className="flex items-center justify-center">
                              {notes[r][c].has(n) ? n : ""}
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </Fragment>
            ))}
          </motion.div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-center gap-2 flex-wrap">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <motion.div key={n} whileTap={{ scale: 0.9 }}>
            <Button onClick={() => handleInput(n)} className="w-10" disabled={!running}>
              {n}
            </Button>
          </motion.div>
        ))}
        <motion.div whileTap={{ scale: 0.9 }}>
          <Button variant="outline" onClick={() => handleInput(0)} disabled={!running}>
            Erase
          </Button>
        </motion.div>
        <motion.div whileTap={{ scale: 0.9 }}>
          <Button variant={pencilMode ? "default" : "outline"} onClick={() => setPencilMode((m) => !m)} disabled={!running}>
            {pencilMode ? "Pencil ON" : "Pencil OFF"}
          </Button>
        </motion.div>
        <motion.div whileTap={{ scale: 0.9 }}>
          <Button variant="ghost" onClick={onTip} disabled={!running}>
            Tip
          </Button>
        </motion.div>
        {selected && (
          <motion.div whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost"
              onClick={() =>
                running && setNotes((old) => {
                  const n = old.map((row) => row.map((s) => new Set(s)));
                  const [r, c] = selected;
                  n[r][c].clear();
                  return n;
                })
              }
              disabled={!running}
            >
              Clear Notes
            </Button>
          </motion.div>
        )}
      </div>

      {/* Count current mistakes (not attempts) */}
      <div className="text-center text-sm text-gray-600">
        Mistakes: {mistakeCount}
      </div>
    </div>
  );
}

