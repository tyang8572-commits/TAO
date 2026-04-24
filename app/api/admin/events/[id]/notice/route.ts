import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/auth";
import { createId, dbGet, dbRun, nowIso } from "@/lib/db";
import { noticeSchema } from "@/lib/validators";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = noticeSchema.parse(body);

    const event = (await dbGet(`SELECT "id" FROM "Event" WHERE "id" = ?`, [params.id])) as { id: string } | undefined;

    if (!event) {
      return NextResponse.json({ error: "活动不存在" }, { status: 404 });
    }

    const existing = (await dbGet(`SELECT "id" FROM "Notice" WHERE "eventId" = ?`, [params.id])) as
      | { id: string }
      | undefined;
    const content = parsed.content || "当前暂无通知。";
    const now = nowIso();

    if (existing) {
      await dbRun(`UPDATE "Notice" SET "content" = ?, "updatedAt" = ? WHERE "id" = ?`, [content, now, existing.id]);
    } else {
      await dbRun(`INSERT INTO "Notice" ("id", "eventId", "content", "createdAt", "updatedAt") VALUES (?, ?, ?, ?, ?)`, [
        createId(),
        params.id,
        content,
        now,
        now
      ]);
    }

    return NextResponse.json({ data: { eventId: params.id, content } });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "保存通知失败"
      },
      { status: 400 }
    );
  }
}
