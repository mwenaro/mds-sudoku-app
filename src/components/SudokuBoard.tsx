"use client";

import { useEffect, useMemo, useState, Fragment } from "react";
import { motion } from "@/lib/motion";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import type { Grid, getTip as getTipFn } from "@/utils/sudoku";
import { getTip as computeTip } from "@/utils/sudoku";

type Props = {
  initial: Grid;
  solution: Grid;
  onComplete?: (stats: { mistakes: number; timeSeconds: number }) => void;
};

export default function SudokuBoard({ initial, solution, onComplete }: Props) {
  const [grid, setGrid] = useState<Grid>(() => initial.map((r) => r.slice()));
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [startTime] = useState(() => Date.now());
  const [tip, setTip] = useState<ReturnType<typeof computeTip> | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [pencilMode, setPencilMode] = useState(false);
  // notes[r][c] is a Set of candidate digits 1-9
  const [notes, setNotes] = useState<Set<number>[][]>(() =>
    Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => new Set<number>()))
  );

  useEffect(() => {
    setGrid(initial.map((r) => r.slice()));
    setSelected(null);
    setMistakes(0);
    setTip(null);
    setElapsed(0);
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
    if (done) {
      const timeSeconds = Math.round((Date.now() - startTime) / 1000);
      onComplete?.({ mistakes, timeSeconds });
    }
  }, [grid, solution, startTime, mistakes, onComplete]);

  // timer
  useEffect(() => {
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(id);
  }, [startTime]);

  function handleInput(val: number) {
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
      return;
    }
    setGrid((g) => {
      const next = g.map((row) => row.slice());
      if (val === 0) next[r][c] = 0;
      else next[r][c] = val;
      if (val !== 0 && solution[r][c] !== val) setMistakes((m) => m + 1);
      // clear notes when value placed
      if (val !== 0) {
        setNotes((old) => {
          const n = old.map((row) => row.map((s) => new Set(s)));
          n[r][c].clear();
          return n;
        });
      }
      return next;
    });
  }

  function onTip() {
    const t = computeTip(grid);
    setTip(t);
    if (t?.highlight?.cells?.[0]) setSelected(t.highlight.cells[0]);
  }

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex items-center justify-between text-sm text-gray-700">
        <div>Mode: {pencilMode ? "Pencil" : "Number"}</div>
        <div>Time: {String(Math.floor(elapsed / 60)).padStart(2, "0")}:{String(elapsed % 60).padStart(2, "0")}</div>
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
                  return (
                    <motion.button
                      key={`${r}-${c}`}
                      onClick={() => setSelected([r, c])}
                      whileTap={{ scale: 0.96 }}
                      animate={sel ? { boxShadow: "0 0 0 2px rgba(99,102,241,0.8) inset" } : {}}
                      className={[
                        "relative aspect-square bg-white flex items-center justify-center text-lg select-none",
                        // grid lines
                        "border border-gray-200",
                        // thicker block borders
                        r % 3 === 0 && "border-t-4 border-t-gray-500",
                        c % 3 === 0 && "border-l-4 border-l-gray-500",
                        (r + 1) % 3 === 0 && "border-b-4 border-b-gray-500",
                        (c + 1) % 3 === 0 && "border-r-4 border-r-gray-500",
                        sel ? "bg-indigo-50" : tipHighlighted ? "bg-yellow-50" : "",
                        given ? "text-gray-900 font-semibold" : "text-indigo-700",
                      ]
                        .filter(Boolean)
                        .join(" ")}
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
            <Button onClick={() => handleInput(n)} className="w-10">
              {n}
            </Button>
          </motion.div>
        ))}
        <motion.div whileTap={{ scale: 0.9 }}>
          <Button variant="outline" onClick={() => handleInput(0)}>
            Erase
          </Button>
        </motion.div>
        <motion.div whileTap={{ scale: 0.9 }}>
          <Button variant={pencilMode ? "default" : "outline"} onClick={() => setPencilMode((m) => !m)}>
            {pencilMode ? "Pencil ON" : "Pencil OFF"}
          </Button>
        </motion.div>
        <motion.div whileTap={{ scale: 0.9 }}>
          <Button variant="ghost" onClick={onTip}>
            Tip
          </Button>
        </motion.div>
        {selected && (
          <motion.div whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost"
              onClick={() =>
                setNotes((old) => {
                  const n = old.map((row) => row.map((s) => new Set(s)));
                  const [r, c] = selected;
                  n[r][c].clear();
                  return n;
                })
              }
            >
              Clear Notes
            </Button>
          </motion.div>
        )}
      </div>

      <div className="text-center text-sm text-gray-600">Mistakes: {mistakes}</div>
    </div>
  );
}

