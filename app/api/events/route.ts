import { NextResponse } from "next/server";

import { getPublicEvents } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getPublicEvents();
  return NextResponse.json({ data });
}
