import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/auth";
import { dbGet, dbRun, nowIso } from "@/lib/db";
import { getEventDetail } from "@/lib/queries";
import { eventSchema, parseEventInput } from "@/lib/validators";

async function removeEvent(id: string) {
  const existing = (await dbGet(`SELECT "id" FROM "Event" WHERE "id" = ?`, [id])) as { id: string } | undefined;
  if (!existing) {
    return NextResponse.json({ error: "活动不存在" }, { status: 404 });
  }

  await dbRun(`DELETE FROM "Event" WHERE "id" = ?`, [id]);
  return NextResponse.json({ success: true });
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const data = await getEventDetail(params.id);
  if (!data) {
    return NextResponse.json({ error: "活动不存在" }, { status: 404 });
  }

  return NextResponse.json({ data });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = eventSchema.parse(body);
    const existing = (await dbGet(`SELECT "id" FROM "Event" WHERE "id" = ?`, [params.id])) as
      | { id: string }
      | undefined;

    if (!existing) {
      return NextResponse.json({ error: "活动不存在" }, { status: 404 });
    }

    const data = parseEventInput(parsed);
    await dbRun(
      `
        UPDATE "Event"
        SET "title" = ?, "eventDate" = ?, "startTime" = ?, "endTime" = ?, "venueName" = ?, "venueAddress" = ?, "capacity" = ?, "signupDeadline" = ?, "description" = ?, "status" = ?, "updatedAt" = ?
        WHERE "id" = ?
      `,
      [
        data.title,
        data.eventDate.toISOString(),
        data.startTime,
        data.endTime,
        data.venueName,
        data.venueAddress,
        data.capacity,
        data.signupDeadline.toISOString(),
        data.description,
        data.status,
        nowIso(),
        params.id
      ]
    );

    return NextResponse.json({ data: { id: params.id } });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "更新活动失败"
      },
      { status: 400 }
    );
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  return removeEvent(params.id);
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const formData = await request.formData();
  const method = formData.get("_method");

  if (method === "DELETE") {
    const response = await removeEvent(params.id);
    if (!response.ok) {
      return response;
    }
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.json({ error: "不支持的操作" }, { status: 400 });
}
