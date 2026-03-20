import { NextResponse } from "next/server";
import fs from "fs";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: { jobId: string } }) {
  const { jobId } = params;
  const jobFile = `/tmp/score-${jobId}.json`;

  try {
    const raw = fs.readFileSync(jobFile, "utf-8");
    return NextResponse.json(JSON.parse(raw));
  } catch {
    // File doesn't exist yet — still pending
    return NextResponse.json({ status: "running" });
  }
}
