import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createGame, getGames } from '@/lib/db';
import { Game as GameModel } from '@/lib/db';
import { GameType } from '@/lib/types';
import connectDB from '@/lib/db';

// Connect to the database


export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    await connectDB();
    const { userId } = await auth();
    let games;
    if (userId) {
      games = await getGames(userId);
    } else {
      games = await getGames();
    }

    // Helper to map level number to difficulty string
    function levelToDifficulty(level: number): string {
      switch (level) {
        case 1: return "easy";
        case 2: return "medium";
        case 3: return "difficult";
        case 4: return "expert";
        case 5: return "nightmare";
        default: return "unknown";
      }
    }

    // Map games to leaderboard row format
    const data = games.map((g, idx) => ({
      id: idx + 1,
      name: g.userId || "-",
      difficulty: levelToDifficulty(g.level),
      time_seconds: g.timeTaken,
      mistakes: g.mistakes ?? 0, // fallback if not present
      created_at: g.date || g.createdAt || new Date(),
      user_id: g.userId || null,
      user_name: g.userId || null,
      user_email: null,
    }));

    return new Response(JSON.stringify({ ok: true, data }), { status: 200 });
  } catch (error:any) {
    console.log("Error is ",error.message);
    return new Response(JSON.stringify({ error: 'Failed to fetch records' }), { status: 500 });
  }
}


export async function POST(request: NextRequest) {
  const { userId } = await auth();
    await connectDB();
  const gameData: GameType = await request.json(); // Updated to use GameType
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  try {
    const game = await createGame({ ...gameData, userId });
    return new Response(JSON.stringify(game), { status: 201 });
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({ error: 'Failed to create game' }), { status: 500 });
  }
}
