import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../../App';
import type { Difficulty } from '../utils/sudoku';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const difficulties: { name: Difficulty; color: string; description: string }[] = [
    { name: 'easy', color: '#10b981', description: '40 empty cells' },
    { name: 'medium', color: '#f59e0b', description: '48 empty cells' },
    { name: 'difficult', color: '#ef4444', description: '54 empty cells' },
    { name: 'expert', color: '#8b5cf6', description: '58 empty cells' },
    { name: 'nightmare', color: '#1f2937', description: '62 empty cells' },
  ];

  const handleStartGame = (difficulty: Difficulty) => {
    navigation.navigate('Game', { difficulty });
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#3b82f6', '#1d4ed8']}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Sudoku</Text>
            <Text style={styles.subtitle}>Choose your difficulty level</Text>
          </View>

          <View style={styles.difficultyContainer}>
            {difficulties.map((diff, index) => (
              <TouchableOpacity
                key={diff.name}
                style={[styles.difficultyButton, { backgroundColor: diff.color }]}
                onPress={() => handleStartGame(diff.name)}
                activeOpacity={0.8}
              >
                <View style={styles.buttonContent}>
                  <Text style={styles.difficultyName}>
                    {diff.name.charAt(0).toUpperCase() + diff.name.slice(1)}
                  </Text>
                  <Text style={styles.difficultyDescription}>
                    {diff.description}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.info}>
            <Text style={styles.infoText}>
              • Fill the 9×9 grid with digits
            </Text>
            <Text style={styles.infoText}>
              • Each row, column, and 3×3 box must contain all digits 1-9
            </Text>
            <Text style={styles.infoText}>
              • Use logical deduction to solve the puzzle
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    color: '#e0e7ff',
    textAlign: 'center',
  },
  difficultyContainer: {
    gap: 16,
    marginBottom: 40,
  },
  difficultyButton: {
    borderRadius: 12,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  buttonContent: {
    alignItems: 'center',
  },
  difficultyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  difficultyDescription: {
    fontSize: 14,
    color: '#f3f4f6',
  },
  info: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#e0e7ff',
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default HomeScreen;