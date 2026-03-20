import { NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/scores";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") ?? undefined;
  const leaderboard = await getLeaderboard(category);
  return NextResponse.json(leaderboard);
}
