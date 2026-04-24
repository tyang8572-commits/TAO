import { NextResponse } from "next/server";

import { createRegistration } from "@/lib/business";
import { isAdminAuthenticated } from "@/lib/auth";
import { REGISTRATION_STATUS } from "@/lib/constants";
import { signupSchema } from "@/lib/validators";

export async function GET() {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  return NextResponse.json({ success: true });
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = signupSchema.parse(body);

    const registration = await createRegistration({
      eventId: params.id,
      name: parsed.name
    });

    return NextResponse.json({
      message: registration.status === REGISTRATION_STATUS.CONFIRMED ? "已加入正式名单" : "已加入候补名单",
      data: registration
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "新增报名失败"
      },
      { status: 400 }
    );
  }
}
