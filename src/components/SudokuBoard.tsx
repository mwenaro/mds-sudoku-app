"use client";

import { useEffect, useMemo, useState } from "react";
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

  useEffect(() => {
    setGrid(initial.map((r) => r.slice()));
    setSelected(null);
    setMistakes(0);
    setTip(null);
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

  function handleInput(val: number) {
    if (!selected) return;
    const [r, c] = selected;
    if (isGiven(r, c)) return;
    setGrid((g) => {
      const next = g.map((row) => row.slice());
      if (val === 0) next[r][c] = 0;
      else next[r][c] = val;
      if (val !== 0 && solution[r][c] !== val) setMistakes((m) => m + 1);
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
      <Card>
        <CardContent>
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-9 gap-[2px] bg-gray-300 p-[2px] max-w-[min(90vw,520px)] mx-auto"
          >
            {grid.map((row, r) => (
              <>
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
                        "aspect-square bg-white flex items-center justify-center text-lg select-none",
                        (r + 1) % 3 === 0 && "border-b-2 border-gray-400",
                        (c + 1) % 3 === 0 && "border-r-2 border-gray-400",
                        "border border-gray-200",
                        sel ? "bg-indigo-50" : tipHighlighted ? "bg-yellow-50" : "",
                        given ? "text-gray-900 font-semibold" : "text-indigo-700",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {val !== 0 ? val : ""}
                    </motion.button>
                  );
                })}
              </>
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
          <Button variant="ghost" onClick={onTip}>
            Tip
          </Button>
        </motion.div>
      </div>

      <div className="text-center text-sm text-gray-600">Mistakes: {mistakes}</div>
    </div>
  );
}

