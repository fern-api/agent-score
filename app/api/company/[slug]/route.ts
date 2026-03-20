import { NextResponse } from "next/server";
import { getCompanyWithFallback } from "@/lib/scores";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  const company = await getCompanyWithFallback(params.slug);
  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }
  return NextResponse.json(company);
}
