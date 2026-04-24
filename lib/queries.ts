import { EVENT_STATUS, REGISTRATION_STATUS, type EventStatus, type RegistrationStatus } from "@/lib/constants";
import { dbAll, dbGet } from "@/lib/db";
import { getEventDisplayStatus, getRegistrationStatusLabel } from "@/lib/format";
import { hasEventEnded, hasEventStarted } from "@/lib/dates";
import { buildNameMatchExpression, getNameMatchKey } from "@/lib/names";
import type { EventDetail, EventSummary, RegistrationView } from "@/lib/types";

type EventRow = {
  id: string;
  title: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  venueName: string;
  venueAddress: string;
  capacity: number;
  signupDeadline: string;
  description: string;
  status: EventStatus;
  notice: string | null;
};

type RegistrationRow = {
  id: string;
  status: RegistrationStatus;
  createdAt: string;
  canceledAt: string | null;
  waitlistPosition: number | null;
  name: string;
};

function getEventCountMaps() {
  return dbAll<{
    eventId: string;
    status: RegistrationStatus;
    total: number;
  }>(
    `
      SELECT "eventId", "status", COUNT(*) AS total
      FROM "Registration"
      WHERE "status" IN (?, ?)
      GROUP BY "eventId", "status"
    `,
    [REGISTRATION_STATUS.CONFIRMED, REGISTRATION_STATUS.WAITLIST]
  ).then((rows) => {
    const confirmedMap = new Map<string, number>();
    const waitlistMap = new Map<string, number>();

    for (const row of rows) {
      if (row.status === REGISTRATION_STATUS.CONFIRMED) {
        confirmedMap.set(row.eventId, Number(row.total));
      } else if (row.status === REGISTRATION_STATUS.WAITLIST) {
        waitlistMap.set(row.eventId, Number(row.total));
      }
    }

    return { confirmedMap, waitlistMap };
  });
}

function serializeEvent(event: EventRow, counts?: { confirmedCount?: number; waitlistCount?: number }): EventSummary {
  const confirmedCount = counts?.confirmedCount ?? 0;
  const waitlistCount = counts?.waitlistCount ?? 0;
  const eventDate = new Date(event.eventDate);
  const ended = hasEventEnded({
    status: event.status,
    eventDate,
    startTime: event.startTime,
    endTime: event.endTime
  });
  const started = hasEventStarted({
    eventDate,
    startTime: event.startTime
  });
  const displayStatus = getEventDisplayStatus({
    status: event.status,
    eventDate,
    startTime: event.startTime,
    endTime: event.endTime,
    confirmedCount,
    capacity: Number(event.capacity)
  });

  return {
    id: event.id,
    title: event.title,
    eventDate: eventDate.toISOString(),
    startTime: event.startTime,
    endTime: event.endTime,
    venueName: event.venueName,
    venueAddress: event.venueAddress,
    capacity: Number(event.capacity),
    description: event.description,
    notice: event.notice,
    status: event.status,
    displayStatus,
    confirmedCount,
    waitlistCount,
    remainingSpots: Math.max(Number(event.capacity) - confirmedCount, 0),
    canRegister: event.status === EVENT_STATUS.OPEN && !ended && !started,
    started,
    ended
  };
}

function serializeRegistration(row: RegistrationRow): RegistrationView {
  return {
    id: row.id,
    name: row.name,
    status: row.status,
    createdAt: new Date(row.createdAt).toISOString(),
    canceledAt: row.canceledAt ? new Date(row.canceledAt).toISOString() : null,
    waitlistPosition: row.waitlistPosition === null ? null : Number(row.waitlistPosition)
  };
}

export async function getPublicEvents() {
  const rows = await dbAll<EventRow>(
    `
      SELECT e.*, n.content AS notice
      FROM "Event" e
      LEFT JOIN "Notice" n ON n."eventId" = e."id"
      ORDER BY e."eventDate" ASC, e."startTime" ASC
    `
  );

  const { confirmedMap, waitlistMap } = await getEventCountMaps();

  return rows
    .map((row) =>
      serializeEvent(row, {
        confirmedCount: confirmedMap.get(row.id) || 0,
        waitlistCount: waitlistMap.get(row.id) || 0
      })
    )
    .filter((event) => !event.ended);
}

export async function getAdminEvents() {
  const rows = await dbAll<EventRow>(
    `
      SELECT e.*, n.content AS notice
      FROM "Event" e
      LEFT JOIN "Notice" n ON n."eventId" = e."id"
      ORDER BY e."eventDate" DESC, e."startTime" DESC
    `
  );

  const { confirmedMap, waitlistMap } = await getEventCountMaps();

  return rows.map((row) =>
    serializeEvent(row, {
      confirmedCount: confirmedMap.get(row.id) || 0,
      waitlistCount: waitlistMap.get(row.id) || 0
    })
  );
}

export async function getEventDetail(eventId: string): Promise<EventDetail | null> {
  const row = await dbGet<EventRow>(
    `
      SELECT e.*, n.content AS notice
      FROM "Event" e
      LEFT JOIN "Notice" n ON n."eventId" = e."id"
      WHERE e."id" = ?
    `,
    [eventId]
  );

  if (!row) return null;

  const registrations = await dbAll<RegistrationRow>(
    `
      SELECT r."id", r."status", r."createdAt", r."canceledAt", r."waitlistPosition", u."name"
      FROM "Registration" r
      INNER JOIN "User" u ON u."id" = r."userId"
      WHERE r."eventId" = ?
      ORDER BY
        CASE WHEN r."status" = '${REGISTRATION_STATUS.CONFIRMED}' THEN 0 ELSE 1 END,
        r."waitlistPosition" ASC,
        r."createdAt" ASC
    `,
    [eventId]
  );

  const confirmedList = registrations
    .filter((item) => item.status === REGISTRATION_STATUS.CONFIRMED)
    .map(serializeRegistration);

  const waitlistList = registrations
    .filter((item) => item.status === REGISTRATION_STATUS.WAITLIST)
    .map(serializeRegistration);

  const summary = serializeEvent(row, {
    confirmedCount: confirmedList.length,
    waitlistCount: waitlistList.length
  });

  return {
    ...summary,
    confirmedList,
    waitlistList
  };
}

export async function getMyRegistrations(name: string) {
  const nameKey = getNameMatchKey(name);

  const rows = await dbAll<{
    id: string;
    eventId: string;
    status: RegistrationStatus;
    createdAt: string;
    eventTitle: string;
    eventDate: string;
    startTime: string;
    endTime: string;
    venueName: string;
  }>(
    `
      SELECT
        r."id",
        r."eventId",
        r."status",
        r."createdAt",
        e."title" AS "eventTitle",
        e."eventDate",
        e."startTime",
        e."endTime",
        e."venueName"
      FROM "Registration" r
      INNER JOIN "User" u ON u."id" = r."userId"
      INNER JOIN "Event" e ON e."id" = r."eventId"
      WHERE ${buildNameMatchExpression('u."name"')} = ?
      ORDER BY r."createdAt" DESC
    `,
    [nameKey]
  );

  return rows.map((item) => ({
    id: item.id,
    eventId: item.eventId,
    eventTitle: item.eventTitle,
    eventDate: new Date(item.eventDate).toISOString(),
    startTime: item.startTime,
    endTime: item.endTime,
    venueName: item.venueName,
    status: item.status,
    statusLabel: getRegistrationStatusLabel(item.status),
    createdAt: new Date(item.createdAt).toISOString()
  }));
}
