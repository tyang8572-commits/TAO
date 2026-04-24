import { EVENT_STATUS, REGISTRATION_STATUS, type EventStatus } from "@/lib/constants";
import { createId, nowIso, transaction } from "@/lib/db";
import { hasEventEnded, hasEventStarted } from "@/lib/dates";

type TxExecutor = {
  all<T>(query: string, params?: Array<string | number | null>): Promise<T[]>;
  get<T>(query: string, params?: Array<string | number | null>): Promise<T | undefined>;
  run(query: string, params?: Array<string | number | null>): Promise<void>;
};

function buildInternalPhone(name: string) {
  return `guest:${Buffer.from(name, "utf8").toString("hex")}`;
}

function ensureEventCanSignup(event: {
  status: EventStatus;
  eventDate: string;
  startTime: string;
  endTime: string;
}) {
  if (event.status === EVENT_STATUS.CANCELED) {
    throw new Error("该活动已取消，无法报名");
  }
  if (
    hasEventEnded({
      status: event.status,
      eventDate: new Date(event.eventDate),
      startTime: event.startTime,
      endTime: event.endTime
    })
  ) {
    throw new Error("该活动已结束，无法报名");
  }
  if (
    hasEventStarted({
      eventDate: new Date(event.eventDate),
      startTime: event.startTime
    })
  ) {
    throw new Error("活动已开始，当前不再接受报名");
  }
}

async function resequenceWaitlist(db: TxExecutor, eventId: string) {
  const waitlist = await db.all<{ id: string }>(
    `
      SELECT id
      FROM "Registration"
      WHERE eventId = ? AND status = ?
      ORDER BY waitlistPosition ASC, createdAt ASC
    `,
    [eventId, REGISTRATION_STATUS.WAITLIST]
  );

  for (const [index, item] of waitlist.entries()) {
    await db.run(`UPDATE "Registration" SET waitlistPosition = ? WHERE id = ?`, [index + 1, item.id]);
  }
}

async function promoteNextWaitlist(db: TxExecutor, eventId: string) {
  const next = await db.get<{ id: string }>(
    `
      SELECT id
      FROM "Registration"
      WHERE eventId = ? AND status = ?
      ORDER BY waitlistPosition ASC, createdAt ASC
      LIMIT 1
    `,
    [eventId, REGISTRATION_STATUS.WAITLIST]
  );

  if (!next) return;

  await db.run(`UPDATE "Registration" SET status = ?, waitlistPosition = NULL WHERE id = ?`, [
    REGISTRATION_STATUS.CONFIRMED,
    next.id
  ]);
}

export async function createRegistration(params: {
  eventId: string;
  name: string;
  bypassEventRestriction?: boolean;
}) {
  const { eventId, name, bypassEventRestriction = false } = params;

  return transaction(async (db) => {
    const event = await db.get<{
      id: string;
      capacity: number;
      status: EventStatus;
      eventDate: string;
      startTime: string;
      endTime: string;
    }>(`SELECT * FROM "Event" WHERE id = ?`, [eventId]);

    if (!event) {
      throw new Error("活动不存在");
    }

    if (!bypassEventRestriction) {
      ensureEventCanSignup(event);
    }

    const now = nowIso();
    const existingUser = await db.get<{ id: string }>(`SELECT id FROM "User" WHERE name = ? LIMIT 1`, [name]);
    let userId = existingUser?.id;

    if (userId) {
      await db.run(`UPDATE "User" SET name = ?, updatedAt = ? WHERE id = ?`, [name, now, userId]);
    } else {
      userId = createId();
      await db.run(`INSERT INTO "User" (id, name, phone, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)`, [
        userId,
        name,
        buildInternalPhone(name),
        now,
        now
      ]);
    }

    const existing = await db.get<{ id: string; status: string }>(
      `
        SELECT r.id, r.status
        FROM "Registration" r
        INNER JOIN "User" u ON u.id = r.userId
        WHERE r.eventId = ? AND u.name = ?
        LIMIT 1
      `,
      [eventId, name]
    );

    if (existing && existing.status !== REGISTRATION_STATUS.CANCELED) {
      throw new Error("你已报名该活动，请勿重复报名");
    }

    const confirmedCount = Number(
      (
        (await db.get<{ total: number }>(
          `SELECT COUNT(*) AS total FROM "Registration" WHERE eventId = ? AND status = ?`,
          [eventId, REGISTRATION_STATUS.CONFIRMED]
        )) || { total: 0 }
      ).total
    );

    const waitlistCount = Number(
      (
        (await db.get<{ total: number }>(
          `SELECT COUNT(*) AS total FROM "Registration" WHERE eventId = ? AND status = ?`,
          [eventId, REGISTRATION_STATUS.WAITLIST]
        )) || { total: 0 }
      ).total
    );

    const targetStatus =
      confirmedCount < Number(event.capacity) ? REGISTRATION_STATUS.CONFIRMED : REGISTRATION_STATUS.WAITLIST;
    const targetPosition = targetStatus === REGISTRATION_STATUS.WAITLIST ? waitlistCount + 1 : null;

    if (existing) {
      await db.run(
        `
          UPDATE "Registration"
          SET status = ?, canceledAt = NULL, waitlistPosition = ?, createdAt = ?
          WHERE id = ?
        `,
        [targetStatus, targetPosition, now, existing.id]
      );
    } else {
      await db.run(
        `
          INSERT INTO "Registration" (id, eventId, userId, status, createdAt, canceledAt, waitlistPosition)
          VALUES (?, ?, ?, ?, ?, NULL, ?)
        `,
        [createId(), eventId, userId, targetStatus, now, targetPosition]
      );
    }

    await resequenceWaitlist(db, eventId);

    return {
      status: targetStatus
    };
  });
}

export async function cancelRegistrationByPhone(params: {
  eventId: string;
  name: string;
  requireNameMatch?: boolean;
}) {
  const { eventId, name, requireNameMatch = true } = params;

  return transaction(async (db) => {
    const user = await db.get<{ id: string; name: string }>(
      `
        SELECT u.id, u.name
        FROM "User" u
        INNER JOIN "Registration" r ON r.userId = u.id
        WHERE r.eventId = ? AND u.name = ? AND r.status != ?
        LIMIT 1
      `,
      [eventId, name, REGISTRATION_STATUS.CANCELED]
    );

    if (!user) {
      throw new Error("未找到报名记录");
    }

    if (requireNameMatch && user.name !== name) {
      throw new Error("姓名不匹配");
    }

    const registration = await db.get<{ id: string; status: string }>(
      `SELECT id, status FROM "Registration" WHERE eventId = ? AND userId = ?`,
      [eventId, user.id]
    );

    if (!registration || registration.status === REGISTRATION_STATUS.CANCELED) {
      throw new Error("未找到可取消的报名记录");
    }

    await db.run(
      `
        UPDATE "Registration"
        SET status = ?, canceledAt = ?, waitlistPosition = NULL
        WHERE id = ?
      `,
      [REGISTRATION_STATUS.CANCELED, nowIso(), registration.id]
    );

    if (registration.status === REGISTRATION_STATUS.CONFIRMED) {
      await promoteNextWaitlist(db, eventId);
    }

    await resequenceWaitlist(db, eventId);
    return true;
  });
}
