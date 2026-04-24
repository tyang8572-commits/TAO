import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/auth";
import { createId, dbRun, nowIso } from "@/lib/db";
import { getAdminEvents } from "@/lib/queries";
import { eventSchema, parseEventInput } from "@/lib/validators";

export async function GET() {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const data = await getAdminEvents();
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = eventSchema.parse(body);
    const data = parseEventInput(parsed);
    const id = createId();
    const now = nowIso();

    await dbRun(
      `
        INSERT INTO "Event"
        ("id", "title", "eventDate", "startTime", "endTime", "venueName", "venueAddress", "capacity", "signupDeadline", "description", "status", "createdAt", "updatedAt")
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        id,
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
        now,
        now
      ]
    );

    return NextResponse.json({ data: { id } });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "创建活动失败"
      },
      { status: 400 }
    );
  }
}
