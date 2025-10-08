"use client";
import { useMemo, useState } from "react";
import SudokuBoard from "@/components/SudokuBoard";
import DifficultySelector from "@/components/DifficultySelector";
import Leaderboard from "@/components/Leaderboard";
import { generate, type Difficulty } from "@/utils/sudoku";
import { Button } from "@/components/ui/button";
import { AuthNav } from "@/components/AuthNav";

export default function Home() {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [showLb, setShowLb] = useState(false);
  const { puzzle, solution } = useMemo(() => generate(difficulty), [difficulty]);

  function onComplete(stats: { mistakes: number; timeSeconds: number }) {
    alert("Puzzle Completed!");
    fetch("/api/records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Player", difficulty, time_seconds: stats.timeSeconds, mistakes: stats.mistakes }),
    }).catch(() => {});
  }

  return (
    <div className="min-h-screen max-w-5xl mx-auto p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sudoku — Next.js 15 Demo</h1>
        <AuthNav />
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <DifficultySelector value={difficulty} onChange={(d) => setDifficulty(d as Difficulty)} />
        <Button variant="outline" onClick={() => setShowLb((s) => !s)}>
          {showLb ? "Hide Leaderboard" : "View Leaderboard"}
        </Button>
      </div>

      {showLb ? (
        <Leaderboard />
      ) : (
        <SudokuBoard initial={puzzle} solution={solution} onComplete={onComplete} />
      )}
    </div>
  );
}
