import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';


// Responsive board and cell sizing
const screenWidth = Dimensions.get('window').width;
const boardSize = Math.min(screenWidth - 32, 360);
const cellSize = boardSize / 9;

// Type definitions
type Grid = number[][];
type Notes = Set<number>[][];

interface SudokuBoardProps {
  grid: Grid;
  solution: Grid;
  notes: Notes;
  selected: [number, number] | null;
  pencilMode: boolean;
  setPencilMode: (v: boolean) => void;
  handleCellPress: (r: number, c: number) => void;
  handleNumberInput: (n: number) => void;
  isGiven: (r: number, c: number) => boolean;
}

function MdsSudokuBoard({ grid, solution, notes, selected, pencilMode, setPencilMode, handleCellPress, handleNumberInput, isGiven }: SudokuBoardProps) {
  // Helper to get cell style
  const getCellStyle = (r: number, c: number) => {
    const isSelected = selected && selected[0] === r && selected[1] === c;
    const isGivenCell = isGiven(r, c);
    const isError = grid[r][c] !== 0 && grid[r][c] !== solution[r][c];
    return [
      styles.cell,
      isSelected && styles.selectedCell,
      isGivenCell && styles.givenCell,
      isError && styles.errorCell,
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

  interface MemoCellProps {
    r: number;
    c: number;
  }
  const MemoCell = React.memo(({ r, c }: MemoCellProps) => {
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
  });

  return (
    <View style={styles.container}>
      {/* Sudoku Grid */}
      <View style={styles.board}>
        {Array.from({ length: 9 }, (_, r) => (
          <View key={r} style={styles.row}>
            {Array.from({ length: 9 }, (_, c) => (
              <MemoCell key={`${r}-${c}`} r={r} c={c} />
            ))}
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

export default React.memo(MdsSudokuBoard);

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

