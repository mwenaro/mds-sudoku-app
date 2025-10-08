import mongoose from 'mongoose';
import { UserType, GameType } from './types';

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  name: { type: String, required: true },
  username: { type: String, required: true },
});

const User = mongoose.models?.User || mongoose.model("User", userSchema);

// Game Schema
const gameSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  level: { type: Number, required: true },
  timeTaken: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

const Game = mongoose.models?.Game || mongoose.model("Game", gameSchema);

export { User, Game };

export const createUser = async (userData: UserType) => {
  const user = new User(userData);
  await user.save();
  return user;
};

export const createGame = async (gameData: GameType) => {
  const game = new Game(gameData);
  await game.save();
  return game;
};



export const getGames = async (userId?: string) => {
  if (userId) {
    return await Game.find({ userId });
  }
  return await Game.find();
};

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || '', {
      // useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;


