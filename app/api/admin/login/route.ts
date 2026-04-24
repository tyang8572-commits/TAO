import { NextResponse } from "next/server";

import { setAdminSession, verifyAdminCredentials } from "@/lib/auth";
import { adminLoginSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = adminLoginSchema.parse(body);

    if (!verifyAdminCredentials(parsed.username, parsed.password)) {
      return NextResponse.json({ error: "账号或密码错误" }, { status: 401 });
    }

    setAdminSession();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "登录失败"
      },
      { status: 400 }
    );
  }
}
