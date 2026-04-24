import { NextResponse } from "next/server";

import { cancelRegistrationByPhone } from "@/lib/business";
import { cancelSchema } from "@/lib/validators";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const parsed = cancelSchema.parse(body);

    await cancelRegistrationByPhone({
      eventId: params.id,
      name: parsed.name,
      requireNameMatch: true
    });

    return NextResponse.json({
      message: "报名已取消，如有候补将自动递补"
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "取消失败"
      },
      { status: 400 }
    );
  }
}
