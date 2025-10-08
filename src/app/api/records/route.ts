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
    return new Response(JSON.stringify(games), { status: 200 });
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
