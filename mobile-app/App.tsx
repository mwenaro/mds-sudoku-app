import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import screens
import { HomeScreen, GameScreen } from './src/screens';

export type RootStackParamList = {
  Home: undefined;
  Game: {
    difficulty: 'easy' | 'medium' | 'difficult' | 'expert' | 'nightmare';
  };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#3b82f6',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen 
            name="Home" 
            component={HomeScreen}
            options={{
              title: 'Sudoku Game',
            }}
          />
          <Stack.Screen 
            name="Game" 
            component={GameScreen}
            options={({ route }) => ({
              title: `${route.params.difficulty.charAt(0).toUpperCase() + route.params.difficulty.slice(1)} Sudoku`,
            })}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});