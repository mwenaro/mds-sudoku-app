// Sudoku utilities: grid representation and logic

export type Grid = number[][]; // 0 denotes empty
export type Difficulty = "easy" | "medium" | "difficult" | "expert" | "nightmare";

const SIZE = 9;
const BOX = 3;

function clone(grid: Grid): Grid {
  return grid.map((r) => r.slice());
}

function boxIndex(r: number, c: number): [number, number] {
  return [Math.floor(r / BOX), Math.floor(c / BOX)];
}

export function isValid(grid: Grid, r: number, c: number, val: number): boolean {
  if (val < 1 || val > 9) return false;
  for (let i = 0; i < SIZE; i++) {
    if (grid[r][i] === val) return false;
    if (grid[i][c] === val) return false;
  }
  const br = Math.floor(r / BOX) * BOX;
  const bc = Math.floor(c / BOX) * BOX;
  for (let i = 0; i < BOX; i++) {
    for (let j = 0; j < BOX; j++) {
      if (grid[br + i][bc + j] === val) return false;
    }
  }
  return true;
}

function findEmpty(grid: Grid): [number, number] | null {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] === 0) return [r, c];
    }
  }
  return null;
}

function shuffled<T>(nums: T[]): T[] {
  const arr = nums.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function solveInPlace(grid: Grid): boolean {
  const empty = findEmpty(grid);
  if (!empty) return true;
  const [r, c] = empty;
  for (const val of shuffled([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
    if (isValid(grid, r, c, val)) {
      grid[r][c] = val;
      if (solveInPlace(grid)) return true;
      grid[r][c] = 0;
    }
  }
  return false;
}

export function solve(grid: Grid): Grid | null {
  const g = clone(grid);
  return solveInPlace(g) ? g : null;
}

export function generateSolved(): Grid {
  const grid: Grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  solveInPlace(grid);
  return grid;
}

function solutionCount(grid: Grid, cap: number = 2): number {
  // Count solutions up to cap to check uniqueness
  let count = 0;
  function dfs(g: Grid) {
    if (count >= cap) return; // early stop
    const empty = findEmpty(g);
    if (!empty) {
      count++;
      return;
    }
    const [r, c] = empty;
    for (let v = 1; v <= 9; v++) {
      if (isValid(g, r, c, v)) {
        g[r][c] = v;
        dfs(g);
        g[r][c] = 0;
        if (count >= cap) return;
      }
    }
  }
  dfs(clone(grid));
  return count;
}

export function generate(difficulty: Difficulty = "easy"): { puzzle: Grid; solution: Grid } {
  // 1) Generate a full solved grid
  const solution = generateSolved();
  // 2) Carve cells while preserving unique solution
  const puzzle = clone(solution);
  const cells: [number, number][] = shuffled(
    Array.from({ length: SIZE * SIZE }, (_, i) => [Math.floor(i / 9), i % 9] as [number, number])
  );

  // Remove rates by difficulty (approximate)
  const removalsByDifficulty: Record<Difficulty, number> = {
    easy: 40,
    medium: 48,
    difficult: 54,
    expert: 58,
    nightmare: 62,
  };
  const targetRemovals = removalsByDifficulty[difficulty] ?? 40;

  let removed = 0;
  for (const [r, c] of cells) {
    const backup = puzzle[r][c];
    if (backup === 0) continue;
    puzzle[r][c] = 0;
    // Ensure still uniquely solvable
    if (solutionCount(puzzle, 2) !== 1) {
      puzzle[r][c] = backup; // revert
    } else {
      removed++;
      if (removed >= targetRemovals) break;
    }
  }

  return { puzzle, solution };
}

// Tip system
export type Tip = {
  type: string;
  description: string;
  highlight: { cells?: [number, number][]; row?: number; col?: number; box?: [number, number] };
};

function candidates(grid: Grid, r: number, c: number): number[] {
  if (grid[r][c] !== 0) return [];
  const opts: number[] = [];
  for (let v = 1; v <= 9; v++) if (isValid(grid, r, c, v)) opts.push(v);
  return opts;
}

export function findNakedSingle(grid: Grid): Tip | null {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] === 0) {
        const opts = candidates(grid, r, c);
        if (opts.length === 1) {
          return {
            type: "naked-single",
            description: `Cell (${r + 1},${c + 1}) can only be ${opts[0]}.`,
            highlight: { cells: [[r, c]] },
          };
        }
      }
    }
  }
  return null;
}

export function getTip(grid: Grid): Tip | null {
  return findNakedSingle(grid);
}

export default {
  isValid,
  solve,
  generateSolved,
  generate,
  findNakedSingle,
  getTip,
};