import { NextResponse } from "next/server";

import { getMyRegistrations } from "@/lib/queries";
import { nameQuerySchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = nameQuerySchema.parse({
      name: searchParams.get("name") || ""
    });

    const data = await getMyRegistrations(parsed.name);
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "查询失败"
      },
      { status: 400 }
    );
  }
}
