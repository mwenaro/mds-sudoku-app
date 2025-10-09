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

export function findHiddenSingle(grid: Grid): Tip | null {
  // Check rows and columns and boxes
  // Rows
  for (let r = 0; r < SIZE; r++) {
    for (let v = 1; v <= 9; v++) {
      let spot: number | null = null;
      for (let c = 0; c < SIZE; c++) {
        if (grid[r][c] === 0 && isValid(grid, r, c, v)) {
          if (spot !== null) {
            spot = -1; // multiple
            break;
          }
          spot = c;
        }
      }
      if (spot !== null && spot >= 0) {
        return {
          type: "hidden-single-row",
          description: `In row ${r + 1}, only column ${spot + 1} can be ${v}.`,
          highlight: { cells: [[r, spot]], row: r },
        };
      }
    }
  }
  // Columns
  for (let c = 0; c < SIZE; c++) {
    for (let v = 1; v <= 9; v++) {
      let spot: number | null = null;
      for (let r = 0; r < SIZE; r++) {
        if (grid[r][c] === 0 && isValid(grid, r, c, v)) {
          if (spot !== null) {
            spot = -1;
            break;
          }
          spot = r;
        }
      }
      if (spot !== null && spot >= 0) {
        return {
          type: "hidden-single-col",
          description: `In column ${c + 1}, only row ${spot + 1} can be ${v}.`,
          highlight: { cells: [[spot, c]], col: c },
        };
      }
    }
  }
  // Boxes
  for (let br = 0; br < BOX; br++) {
    for (let bc = 0; bc < BOX; bc++) {
      for (let v = 1; v <= 9; v++) {
        let cell: [number, number] | null = null;
        for (let i = 0; i < BOX; i++) {
          for (let j = 0; j < BOX; j++) {
            const r = br * BOX + i;
            const c = bc * BOX + j;
            if (grid[r][c] === 0 && isValid(grid, r, c, v)) {
              if (cell) {
                cell = [-1, -1];
                i = BOX; // break outer loops
                break;
              }
              cell = [r, c];
            }
          }
        }
        if (cell && cell[0] >= 0) {
          return {
            type: "hidden-single-box",
            description: `In box (${br + 1},${bc + 1}), only one cell can be ${v}.`,
            highlight: { cells: [cell], box: [br, bc] },
          };
        }
      }
    }
  }
  return null;
}

// Advanced techniques (simplified implementations)
export function findNakedPair(grid: Grid): Tip | null {
  // Check rows
  for (let r = 0; r < SIZE; r++) {
    const candCells: Array<{ c: number; cand: number[] }> = [];
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] === 0) {
        const cand = candidates(grid, r, c);
        if (cand.length === 2) candCells.push({ c, cand: cand.sort() });
      }
    }
    for (let i = 0; i < candCells.length; i++) {
      for (let j = i + 1; j < candCells.length; j++) {
        const a = candCells[i], b = candCells[j];
        if (a.cand[0] === b.cand[0] && a.cand[1] === b.cand[1]) {
          // same pair appears exactly in these two -> elimination elsewhere in row
          const pair = a.cand;
          const affected: [number, number][] = [];
          for (let c = 0; c < SIZE; c++) {
            if (c !== a.c && c !== b.c && grid[r][c] === 0) {
              const cand = candidates(grid, r, c);
              if (cand.includes(pair[0]) || cand.includes(pair[1])) affected.push([r, c]);
            }
          }
          if (affected.length) {
            return {
              type: "naked-pair-row",
              description: `Row ${r + 1} has a naked pair ${pair.join(",")} locking candidates in two cells.`,
              highlight: { cells: [[r, a.c], [r, b.c], ...affected], row: r },
            };
          }
        }
      }
    }
  }
  // Columns similar
  for (let c = 0; c < SIZE; c++) {
    const candCells: Array<{ r: number; cand: number[] }> = [];
    for (let r = 0; r < SIZE; r++) {
      if (grid[r][c] === 0) {
        const cand = candidates(grid, r, c);
        if (cand.length === 2) candCells.push({ r, cand: cand.sort() });
      }
    }
    for (let i = 0; i < candCells.length; i++) {
      for (let j = i + 1; j < candCells.length; j++) {
        const a = candCells[i], b = candCells[j];
        if (a.cand[0] === b.cand[0] && a.cand[1] === b.cand[1]) {
          const pair = a.cand;
          const affected: [number, number][] = [];
          for (let r = 0; r < SIZE; r++) {
            if (r !== a.r && r !== b.r && grid[r][c] === 0) {
              const cand = candidates(grid, r, c);
              if (cand.includes(pair[0]) || cand.includes(pair[1])) affected.push([r, c]);
            }
          }
          if (affected.length) {
            return {
              type: "naked-pair-col",
              description: `Column ${c + 1} has a naked pair ${pair.join(",")} locking candidates in two cells.`,
              highlight: { cells: [[a.r, c], [b.r, c], ...affected], col: c },
            };
          }
        }
      }
    }
  }
  return null;
}

export function findHiddenPair(grid: Grid): Tip | null {
  // simplified: check row for two numbers appearing only in same two cells
  function scanGroup(cells: [number, number][], label: string, meta: any): Tip | null {
    const canMap: Record<string, [number, number][]> = {};
    for (const [r, c] of cells) {
      if (grid[r][c] !== 0) continue;
      const cand = candidates(grid, r, c);
      for (const v of cand) {
        const key = String(v);
        (canMap[key] ??= []).push([r, c]);
      }
    }
    const entries = Object.entries(canMap);
    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        const [v1, cells1] = entries[i];
        const [v2, cells2] = entries[j];
        const set1 = new Set(cells1.map((x) => x.toString()));
        const set2 = new Set(cells2.map((x) => x.toString()));
        const inter = [...set1].filter((s) => set2.has(s)).map((s) => s.split(",").map(Number) as [number, number]);
        if (inter.length === 2) {
          return {
            type: `hidden-pair-${label}`,
            description: `${label} has a hidden pair ${v1},${v2} confined to two cells.`,
            highlight: { cells: inter as [number, number][], ...meta },
          };
        }
      }
    }
    return null;
  }
  // rows
  for (let r = 0; r < SIZE; r++) {
    const cells: [number, number][] = Array.from({ length: SIZE }, (_, c) => [r, c]);
    const tip = scanGroup(cells, "row", { row: r });
    if (tip) return tip;
  }
  // cols
  for (let c = 0; c < SIZE; c++) {
    const cells: [number, number][] = Array.from({ length: SIZE }, (_, r) => [r, c]);
    const tip = scanGroup(cells, "col", { col: c });
    if (tip) return tip;
  }
  // boxes
  for (let br = 0; br < BOX; br++) {
    for (let bc = 0; bc < BOX; bc++) {
      const cells: [number, number][] = [];
      for (let i = 0; i < BOX; i++) for (let j = 0; j < BOX; j++) cells.push([br * BOX + i, bc * BOX + j]);
      const tip = scanGroup(cells, "box", { box: [br, bc] as [number, number] });
      if (tip) return tip;
    }
  }
  return null;
}

export function findPointingPair(grid: Grid): Tip | null {
  // For each box, if a candidate v appears only in one row/col within the box, eliminate elsewhere in that row/col
  for (let br = 0; br < BOX; br++) {
    for (let bc = 0; bc < BOX; bc++) {
      for (let v = 1; v <= 9; v++) {
        const coords: [number, number][] = [];
        for (let i = 0; i < BOX; i++) {
          for (let j = 0; j < BOX; j++) {
            const r = br * BOX + i;
            const c = bc * BOX + j;
            if (grid[r][c] === 0 && isValid(grid, r, c, v)) coords.push([r, c]);
          }
        }
        if (coords.length >= 2) {
          const rows = new Set(coords.map((x) => x[0]));
          const cols = new Set(coords.map((x) => x[1]));
          if (rows.size === 1) {
            const r = [...rows][0]!;
            const affected: [number, number][] = [];
            for (let c = 0; c < SIZE; c++) {
              const inBox = Math.floor(r / BOX) === br && Math.floor(c / BOX) === bc;
              if (!inBox && grid[r][c] === 0 && isValid(grid, r, c, v)) affected.push([r, c]);
            }
            if (affected.length) {
              return {
                type: "pointing-pair-row",
                description: `Pointing pair: candidate ${v} in box (${br + 1},${bc + 1}) lies only in row ${r + 1}.`,
                highlight: { cells: [...coords, ...affected], box: [br, bc], row: r },
              };
            }
          }
          if (cols.size === 1) {
            const c = [...cols][0]!;
            const affected: [number, number][] = [];
            for (let r = 0; r < SIZE; r++) {
              const inBox = Math.floor(c / BOX) === bc && Math.floor(r / BOX) === br;
              if (!inBox && grid[r][c] === 0 && isValid(grid, r, c, v)) affected.push([r, c]);
            }
            if (affected.length) {
              return {
                type: "pointing-pair-col",
                description: `Pointing pair: candidate ${v} in box (${br + 1},${bc + 1}) lies only in column ${c + 1}.`,
                highlight: { cells: [...coords, ...affected], box: [br, bc], col: c },
              };
            }
          }
        }
      }
    }
  }
  return null;
}

export function findXWing(grid: Grid): Tip | null {
  // Simplified X-Wing detection for rows
  function xwingRows(v: number): Tip | null {
    const rowCols: number[][] = [];
    for (let r = 0; r < SIZE; r++) {
      const cols: number[] = [];
      for (let c = 0; c < SIZE; c++) {
        if (grid[r][c] === 0 && isValid(grid, r, c, v)) cols.push(c);
      }
      if (cols.length === 2) rowCols.push((cols as number[]).concat(r)); // store [c1,c2,r]
      else rowCols.push([]);
    }
    for (let r1 = 0; r1 < SIZE; r1++) {
      if (rowCols[r1].length !== 3) continue;
      for (let r2 = r1 + 1; r2 < SIZE; r2++) {
        if (rowCols[r2].length !== 3) continue;
        const [c1a, c2a] = rowCols[r1];
        const [c1b, c2b] = rowCols[r2];
        if (c1a === c1b && c2a === c2b) {
          const affected: [number, number][] = [];
          for (let r = 0; r < SIZE; r++) {
            if (r !== r1 && r !== r2) {
              if (grid[r][c1a] === 0 && isValid(grid, r, c1a, v)) affected.push([r, c1a]);
              if (grid[r][c2a] === 0 && isValid(grid, r, c2a, v)) affected.push([r, c2a]);
            }
          }
          if (affected.length) {
            return {
              type: "x-wing-rows",
              description: `X-Wing on ${v} using rows ${r1 + 1} and ${r2 + 1} on columns ${c1a + 1} and ${c2a + 1}.`,
              highlight: { cells: affected, row: r1 },
            };
          }
        }
      }
    }
    return null;
  }
  for (let v = 1; v <= 9; v++) {
    const t = xwingRows(v);
    if (t) return t;
  }
  return null;
}

export function getTip(grid: Grid): Tip | null {
  return (
    findNakedSingle(grid) ||
    findHiddenSingle(grid) ||
    findNakedPair(grid) ||
    findHiddenPair(grid) ||
    findPointingPair(grid) ||
    findXWing(grid)
  );
}

export default {
  isValid,
  solve,
  generateSolved,
  generate,
  findNakedSingle,
  findHiddenSingle,
  findNakedPair,
  findHiddenPair,
  findPointingPair,
  findXWing,
  getTip,
};
