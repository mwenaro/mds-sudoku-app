import React from 'react';
import { View, Text, Button } from 'react-native';

const HomeScreen = ({ navigation }) => {
  return (
    <View>
      <Text>Welcome to Sudoku!</Text>
      <Button
        title="Start Game"
        onPress={() => navigation.navigate('Game')}
      />
    </View>
  );
};

export default HomeScreen;
