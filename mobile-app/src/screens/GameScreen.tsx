import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { generate, type Difficulty, type Grid } from '../utils/sudoku';
import { useGameStore } from '../store/gameStore';
import SudokuBoard from '../components/SudokuBoard';

type GameScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Game'>;
type GameScreenRouteProp = RouteProp<RootStackParamList, 'Game'>;

const GameScreen: React.FC = () => {
  const navigation = useNavigation<GameScreenNavigationProp>();
  const route = useRoute<GameScreenRouteProp>();
  const { difficulty } = route.params;

  const {
    running,
    completed,
    elapsed,
    start,
    pause,
    reset,
    updateElapsed,
    setCompleted,
    baseMs,
    lastStartAt,
  } = useGameStore();

  const [started, setStarted] = useState(false);
  const [mistakeCount, setMistakeCount] = useState(0);

  const { puzzle, solution } = useMemo(() => generate(difficulty), [difficulty]);

  // Timer effect
  useEffect(() => {
    if (!running) {
      updateElapsed();
      return;
    }
    const id = setInterval(() => {
      updateElapsed();
    }, 250);
    return () => clearInterval(id);
  }, [running, updateElapsed]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setStarted(true);
    start();
  };

  const handlePause = () => {
    pause();
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Game',
      'Are you sure you want to reset the current game?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            reset();
            setStarted(false);
            setMistakeCount(0);
          },
        },
      ]
    );
  };

  const handleNewGame = () => {
    Alert.alert(
      'New Game',
      'Start a new game with the same difficulty?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'New Game',
          onPress: () => {
            // This will trigger a remount with new puzzle
            navigation.replace('Game', { difficulty });
          },
        },
      ]
    );
  };

  const onComplete = (stats: { mistakes: number; timeSeconds: number }) => {
    if (!completed) {
      setCompleted(true);
      Alert.alert(
        'Congratulations!',
        `Puzzle completed!\nTime: ${formatTime(stats.timeSeconds)}\nMistakes: ${stats.mistakes}`,
        [
          { text: 'New Game', onPress: handleNewGame },
          { text: 'Home', onPress: () => navigation.navigate('Home') },
        ]
      );
    }
  };

  const onMistake = () => {
    setMistakeCount(prev => prev + 1);
  };

  if (!started) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centeredContent}>
          <Text style={styles.difficultyTitle}>
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Sudoku
          </Text>
          <Text style={styles.instruction}>
            Ready to start your {difficulty} puzzle?
          </Text>
          <TouchableOpacity style={styles.startButton} onPress={handleStart}>
            <Text style={styles.startButtonText}>Start Game</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Game Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Time</Text>
            <Text style={styles.statValue}>{formatTime(elapsed)}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Mistakes</Text>
            <Text style={styles.statValue}>{mistakeCount}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Difficulty</Text>
            <Text style={styles.statValue}>
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </Text>
          </View>
        </View>

        {/* Game Controls */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={[styles.controlButton, running ? styles.pauseButton : styles.resumeButton]}
            onPress={running ? handlePause : start}
            disabled={completed}
          >
            <Text style={styles.controlButtonText}>
              {running ? 'Pause' : elapsed > 0 ? 'Resume' : 'Start'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, styles.resetButton]}
            onPress={handleReset}
            disabled={running && elapsed === 0}
          >
            <Text style={styles.controlButtonText}>Reset</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, styles.newGameButton]}
            onPress={handleNewGame}
          >
            <Text style={styles.controlButtonText}>New</Text>
          </TouchableOpacity>
        </View>

        {/* Sudoku Board */}
        <SudokuBoard
          initial={puzzle}
          solution={solution}
          onComplete={onComplete}
          onMistake={onMistake}
          isGameRunning={running}
          completed={completed}
          baseMs={baseMs}
          lastStartAt={lastStartAt}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flexGrow: 1,
    padding: 16,
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  difficultyTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  instruction: {
    fontSize: 18,
    color: '#6b7280',
    marginBottom: 32,
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  controlButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  pauseButton: {
    backgroundColor: '#f59e0b',
  },
  resumeButton: {
    backgroundColor: '#10b981',
  },
  resetButton: {
    backgroundColor: '#ef4444',
  },
  newGameButton: {
    backgroundColor: '#6366f1',
  },
  controlButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default GameScreen;