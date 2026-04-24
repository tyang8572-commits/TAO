import { NextResponse } from "next/server";

import { getEventDetail } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const data = await getEventDetail(params.id);

  if (!data) {
    return NextResponse.json({ error: "活动不存在" }, { status: 404 });
  }

  return NextResponse.json({ data });
}
