import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/auth";
import { REGISTRATION_STATUS } from "@/lib/constants";
import { dbAll, dbGet } from "@/lib/db";

function csvCell(value: string | number | null) {
  const raw = value === null ? "" : String(value);
  return `"${raw.replace(/"/g, '""')}"`;
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const event = (await dbGet(`SELECT title FROM "Event" WHERE id = ?`, [params.id])) as
    | { title: string }
    | undefined;

  if (!event) {
    return NextResponse.json({ error: "活动不存在" }, { status: 404 });
  }

  const registrations = (await dbAll(
    `
      SELECT u.name, r.status, r.createdAt, r.waitlistPosition
      FROM "Registration" r
      INNER JOIN "User" u ON u.id = r.userId
      WHERE r.eventId = ? AND r.status IN (?, ?)
      ORDER BY
        CASE WHEN r.status = '${REGISTRATION_STATUS.CONFIRMED}' THEN 0 ELSE 1 END,
        r.waitlistPosition ASC,
        r.createdAt ASC
    `,
    [params.id, REGISTRATION_STATUS.CONFIRMED, REGISTRATION_STATUS.WAITLIST]
  )) as Array<{
    name: string;
    status: string;
    createdAt: string;
    waitlistPosition: number | null;
  }>;

  const lines = [
    ["姓名", "状态", "报名时间", "候补顺序"].map(csvCell).join(","),
    ...registrations.map((item) =>
      [
        item.name,
        item.status === REGISTRATION_STATUS.CONFIRMED ? "正式" : "候补",
        item.createdAt,
        item.waitlistPosition
      ]
        .map(csvCell)
        .join(",")
    )
  ];

  return new NextResponse(`\ufeff${lines.join("\n")}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(event.title)}-registrations.csv"`
    }
  });
}
