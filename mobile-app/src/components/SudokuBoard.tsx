import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
// import { useGameStore } from '../store/gameStore';
import type { Grid } from '../utils/sudoku';

const { width: screenWidth } = Dimensions.get('window');
const boardSize = Math.min(screenWidth - 32, 400);
const cellSize = boardSize / 9;

type Props = {
  initial: Grid;
  solution: Grid;
  onComplete?: (stats: { mistakes: number; timeSeconds: number }) => void;
  onMistake?: () => void;
  isGameRunning: boolean;
};

export default function SudokuBoard({ 
  initial, 
  solution, 
  onComplete, 
  onMistake,
  isGameRunning,
  completed,
  baseMs,
  lastStartAt
}: Props & { completed: boolean; baseMs: number; lastStartAt: number | null }) {

  const [grid, setGrid] = useState<Grid>(() => initial.map((r) => r.slice()));
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [pencilMode, setPencilMode] = useState(false);
  const [notes, setNotes] = useState<Set<number>[][]>(() =>
    Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => new Set<number>()))
  );

  const isGiven = useMemo(() => {
    const given = new Set<string>();
    initial.forEach((row, r) =>
      row.forEach((v, c) => {
        if (v !== 0) given.add(`${r},${c}`);
      })
    );
    return (r: number, c: number) => given.has(`${r},${c}`);
  }, [initial]);

  // Reset grid when initial changes (new game)
  useEffect(() => {
    setGrid(initial.map((r) => r.slice()));
    setSelected(null);
    setMistakeCount(0);
    setNotes(Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => new Set<number>())));
  }, [initial]);

  // Check for completion only when grid or solution changes, and avoid calling setCompleted in render
  useEffect(() => {
    if (completed) return;
    const done = grid.every((r, i) => r.every((v, j) => v === solution[i][j]));
    if (done) {
      const now = Date.now();
      const ms = baseMs + (isGameRunning && lastStartAt ? now - lastStartAt : 0);
      const timeSeconds = Math.round(ms / 1000);
      onComplete?.({ mistakes: mistakeCount, timeSeconds });
    }
  }, [grid, solution, completed, baseMs, isGameRunning, lastStartAt, onComplete, mistakeCount]);

  const handleCellPress = (r: number, c: number) => {
    if (!isGameRunning) return;
    setSelected([r, c]);
  };

  const handleNumberInput = (val: number) => {
    if (!isGameRunning || !selected) return;
    
    const [r, c] = selected;
    if (isGiven(r, c)) return;

    if (pencilMode && val !== 0) {
      // Toggle note
      setNotes((old) => {
        const n = old.map((row) => row.map((s) => new Set(s)));
        if (n[r][c].has(val)) {
          n[r][c].delete(val);
        } else {
          n[r][c].add(val);
        }
        return n;
      });
      return;
    }

    setGrid((g) => {
      const next = g.map((row) => row.slice());
      const prevVal = g[r][c];
      
      if (val === 0) {
        next[r][c] = 0;
      } else {
        next[r][c] = val;
        
        // Check if it's a mistake
        if (val !== solution[r][c] && prevVal !== val) {
          setMistakeCount((count) => count + 1);
          onMistake?.();
        }
        
        // Clear notes when value placed
        setNotes((old) => {
          const n = old.map((row) => row.map((s) => new Set(s)));
          n[r][c].clear();
          return n;
        });
      }
      
      return next;
    });
  };

  const getCellStyle = (r: number, c: number) => {
    const isSelected = selected && selected[0] === r && selected[1] === c;
    const isGivenCell = isGiven(r, c);
    const isError = grid[r][c] !== 0 && grid[r][c] !== solution[r][c];
    
    return [
      styles.cell,
      isSelected && styles.selectedCell,
      isGivenCell && styles.givenCell,
      isError && styles.errorCell,
      // Border styles for 3x3 box separation
      (r + 1) % 3 === 0 && r !== 8 && styles.bottomBorder,
      (c + 1) % 3 === 0 && c !== 8 && styles.rightBorder,
    ];
  };

  const getCellTextStyle = (r: number, c: number) => {
    const isGivenCell = isGiven(r, c);
    const isError = grid[r][c] !== 0 && grid[r][c] !== solution[r][c];
    
    return [
      styles.cellText,
      isGivenCell && styles.givenText,
      isError && styles.errorText,
    ];
  };

  const renderCell = (r: number, c: number) => {
    const value = grid[r][c];
    const cellNotes = notes[r][c];
    
    return (
      <TouchableOpacity
        key={`${r}-${c}`}
        style={getCellStyle(r, c)}
        onPress={() => handleCellPress(r, c)}
        activeOpacity={0.7}
      >
        {value !== 0 ? (
          <Text style={getCellTextStyle(r, c)}>{value}</Text>
        ) : cellNotes.size > 0 ? (
          <View style={styles.notesContainer}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <Text
                key={num}
                style={[
                  styles.noteText,
                  !cellNotes.has(num) && styles.hiddenNote,
                ]}
              >
                {num}
              </Text>
            ))}
          </View>
        ) : null}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Sudoku Grid */}
      <View style={styles.board}>
        {Array.from({ length: 9 }, (_, r) => (
          <View key={r} style={styles.row}>
            {Array.from({ length: 9 }, (_, c) => renderCell(r, c))}
          </View>
        ))}
      </View>

      {/* Input Controls */}
      <View style={styles.controls}>
        {/* Mode Toggle */}
        <TouchableOpacity
          style={[styles.modeButton, pencilMode && styles.activeModeButton]}
          onPress={() => setPencilMode(!pencilMode)}
        >
          <Text style={[styles.modeButtonText, pencilMode && styles.activeModeButtonText]}>
            {pencilMode ? '✏️ Pencil' : '🔢 Number'}
          </Text>
        </TouchableOpacity>

        {/* Number Buttons */}
        <View style={styles.numberGrid}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <TouchableOpacity
              key={num}
              style={styles.numberButton}
              onPress={() => handleNumberInput(num)}
              disabled={!selected}
            >
              <Text style={[styles.numberButtonText, !selected && styles.disabledText]}>
                {num}
              </Text>
            </TouchableOpacity>
          ))}
          
          {/* Clear button */}
          <TouchableOpacity
            style={[styles.numberButton, styles.clearButton]}
            onPress={() => handleNumberInput(0)}
            disabled={!selected}
          >
            <Text style={[styles.numberButtonText, !selected && styles.disabledText]}>
              Clear
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  board: {
    width: boardSize,
    height: boardSize,
    backgroundColor: '#1f2937',
    borderWidth: 2,
    borderColor: '#1f2937',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: cellSize,
    height: cellSize,
    backgroundColor: '#ffffff',
    borderWidth: 0.5,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCell: {
    backgroundColor: '#dbeafe',
  },
  givenCell: {
    backgroundColor: '#f3f4f6',
  },
  errorCell: {
    backgroundColor: '#fecaca',
  },
  bottomBorder: {
    borderBottomWidth: 2,
    borderBottomColor: '#1f2937',
  },
  rightBorder: {
    borderRightWidth: 2,
    borderRightColor: '#1f2937',
  },
  cellText: {
    fontSize: cellSize * 0.6,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  givenText: {
    color: '#374151',
    fontWeight: '900',
  },
  errorText: {
    color: '#dc2626',
  },
  notesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noteText: {
    fontSize: cellSize * 0.2,
    color: '#6b7280',
    width: '33.33%',
    textAlign: 'center',
  },
  hiddenNote: {
    opacity: 0,
  },
  controls: {
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  modeButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  activeModeButton: {
    backgroundColor: '#3b82f6',
  },
  modeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  activeModeButtonText: {
    color: '#ffffff',
  },
  numberGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  numberButton: {
    width: (screenWidth - 64) / 5 - 8,
    height: 50,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  clearButton: {
    backgroundColor: '#ef4444',
    width: (screenWidth - 64) / 2 - 4,
  },
  numberButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  disabledText: {
    color: '#9ca3af',
  },
});