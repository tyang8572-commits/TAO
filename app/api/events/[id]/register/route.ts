import { NextResponse } from "next/server";

import { createRegistration } from "@/lib/business";
import { REGISTRATION_STATUS } from "@/lib/constants";
import { signupSchema } from "@/lib/validators";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const parsed = signupSchema.parse(body);
    const registration = await createRegistration({
      eventId: params.id,
      name: parsed.name
    });

    const label = registration.status === REGISTRATION_STATUS.CONFIRMED ? "已报名（正式）" : "已报名（候补）";

    return NextResponse.json({
      message: label,
      data: {
        status: registration.status
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "报名失败"
      },
      { status: 400 }
    );
  }
}
