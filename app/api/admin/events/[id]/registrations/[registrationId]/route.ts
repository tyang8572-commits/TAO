import { NextResponse } from "next/server";

import { cancelRegistrationByPhone } from "@/lib/business";
import { isAdminAuthenticated } from "@/lib/auth";
import { dbGet } from "@/lib/db";

export async function DELETE(
  _: Request,
  { params }: { params: { id: string; registrationId: string } }
) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const registration = (await dbGet(
    `
      SELECT r."eventId", u."name"
      FROM "Registration" r
      INNER JOIN "User" u ON u."id" = r."userId"
      WHERE r."id" = ?
    `,
    [params.registrationId]
  )) as { eventId: string; name: string } | undefined;

  if (!registration || registration.eventId !== params.id) {
    return NextResponse.json({ error: "报名记录不存在" }, { status: 404 });
  }

  try {
    await cancelRegistrationByPhone({
      eventId: params.id,
      name: registration.name,
      requireNameMatch: false
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "删除报名失败"
      },
      { status: 400 }
    );
  }
}
