import { NextRequest } from "next/server";
import db from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const rows = db.prepare(
      `SELECT id, name, difficulty, time_seconds, mistakes, created_at FROM records ORDER BY created_at DESC LIMIT 100`
    ).all();
    return Response.json({ ok: true, data: rows }, { status: 200 });
  } catch (err) {
    console.error("GET /api/records error", err);
    return Response.json({ ok: false, error: "Failed to fetch records" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, difficulty, time_seconds, mistakes } = body ?? {};
    if (!name || !difficulty || typeof time_seconds !== "number" || typeof mistakes !== "number") {
      return Response.json({ ok: false, error: "Invalid payload" }, { status: 400 });
    }
    const stmt = db.prepare(
      `INSERT INTO records (name, difficulty, time_seconds, mistakes) VALUES (?, ?, ?, ?)`
    );
    const info = stmt.run(name, difficulty, time_seconds, mistakes);
    return Response.json({ ok: true, id: info.lastInsertRowid }, { status: 201 });
  } catch (err) {
    console.error("POST /api/records error", err);
    return Response.json({ ok: false, error: "Failed to save record" }, { status: 500 });
  }
}
