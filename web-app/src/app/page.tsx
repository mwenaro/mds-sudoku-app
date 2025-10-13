"use client";
import { useMemo, useState } from "react";
import SudokuBoard from "@/components/SudokuBoard";
import DifficultySelector from "@/components/DifficultySelector";
import Leaderboard from "@/components/Leaderboard";
import { generate, type Difficulty } from "@/utils/sudoku";
import { Button } from "@/components/ui/button";
import { AuthNav } from "@/components/AuthNav";
import { useGameStore } from "@/store/gameStore";


export default function Home() {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [showLb, setShowLb] = useState(false);
  const [started, setStarted] = useState(false);
  const { reset } = useGameStore();
  const { puzzle, solution } = useMemo(() => generate(difficulty), [difficulty]);

  // Helper to map difficulty string to numeric level
  function difficultyToLevel(d: Difficulty): number {
    switch (d) {
      case "easy": return 1;
      case "medium": return 2;
      case "difficult": return 3;
      case "expert": return 4;
      case "nightmare": return 5;
      default: return 0;
    }
  }

  function onComplete(stats: { mistakes: number; timeSeconds: number }) {
    alert("Puzzle Completed!");
    fetch("/api/records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        level: difficultyToLevel(difficulty),
        timeTaken: stats.timeSeconds,
        // Optionally include mistakes if you want to store it in the DB
      }),
    }).catch(() => {});
  }

  // Reset game state when difficulty changes
  function handleDifficultyChange(d: Difficulty) {
    setDifficulty(d);
    setStarted(false);
    reset();
  }

  function handleStart() {
    setStarted(true);
  }

  return (
    <div className="min-h-screen max-w-5xl mx-auto p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mds Sudoku</h1>
        <AuthNav />
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <DifficultySelector value={difficulty} onChange={(d) => handleDifficultyChange(d as Difficulty)} />
        <Button variant="outline" onClick={() => setShowLb((s) => !s)}>
          {showLb ? "Hide Leaderboard" : "View Leaderboard"}
        </Button>
      </div>

      {showLb ? (
        <Leaderboard />
      ) : !started ? (
        <div className="flex flex-col items-center gap-4">
          <Button size="lg" onClick={handleStart}>
            Start Game
          </Button>
        </div>
      ) : (
        <SudokuBoard initial={puzzle} solution={solution} onComplete={onComplete} />
      )}
    </div>
  );
}
