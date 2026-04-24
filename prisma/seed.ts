import { EVENT_STATUS, REGISTRATION_STATUS } from "../lib/constants";
import { createId, dbRun, nowIso, resetAllTables } from "../lib/db";

function daysFromNow(days: number, hours = 0) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hours, 0, 0, 0);
  return date.toISOString();
}

async function insertUser(name: string, phone: string) {
  const id = createId();
  const now = nowIso();

  await dbRun(`INSERT INTO "User" ("id", "name", "phone", "createdAt", "updatedAt") VALUES (?, ?, ?, ?, ?)`, [
    id,
    name,
    phone,
    now,
    now
  ]);

  return id;
}

async function insertEvent(params: {
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
  status: string;
}) {
  const now = nowIso();

  await dbRun(
    `
      INSERT INTO "Event"
      ("id", "title", "eventDate", "startTime", "endTime", "venueName", "venueAddress", "capacity", "signupDeadline", "description", "status", "createdAt", "updatedAt")
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      params.id,
      params.title,
      params.eventDate,
      params.startTime,
      params.endTime,
      params.venueName,
      params.venueAddress,
      params.capacity,
      params.signupDeadline,
      params.description,
      params.status,
      now,
      now
    ]
  );
}

async function insertNotice(eventId: string, content: string) {
  const now = nowIso();

  await dbRun(`INSERT INTO "Notice" ("id", "eventId", "content", "createdAt", "updatedAt") VALUES (?, ?, ?, ?, ?)`, [
    createId(),
    eventId,
    content,
    now,
    now
  ]);
}

async function insertRegistration(params: {
  eventId: string;
  userId: string;
  status: string;
  waitlistPosition: number | null;
}) {
  await dbRun(
    `
      INSERT INTO "Registration" ("id", "eventId", "userId", "status", "createdAt", "canceledAt", "waitlistPosition")
      VALUES (?, ?, ?, ?, ?, NULL, ?)
    `,
    [createId(), params.eventId, params.userId, params.status, nowIso(), params.waitlistPosition]
  );
}

async function main() {
  await resetAllTables();

  const users = await Promise.all(
    [
      ["张三", "13800000001"],
      ["李四", "13800000002"],
      ["王五", "13800000003"],
      ["赵六", "13800000004"],
      ["小周", "13800000005"],
      ["小陈", "13800000006"],
      ["阿凯", "13800000007"],
      ["阿晴", "13800000008"]
    ].map(async ([name, phone]) => ({
      id: await insertUser(name, phone),
      name,
      phone
    }))
  );

  const openEventId = createId();
  await insertEvent({
    id: openEventId,
    title: "周六晚场友谊局",
    eventDate: daysFromNow(2),
    startTime: "19:00",
    endTime: "21:00",
    venueName: "青羽体育馆",
    venueAddress: "东京江东区湾岸体育中心 2F",
    capacity: 8,
    signupDeadline: daysFromNow(2, 16),
    description: "双打为主，羽球自备，现场 AA 分摊场地费。",
    status: EVENT_STATUS.OPEN
  });
  await insertNotice(openEventId, "请提前 10 分钟到场热身，第一次来场馆的球友记得带室内鞋。");

  const fullEventId = createId();
  await insertEvent({
    id: fullEventId,
    title: "周日晨练局",
    eventDate: daysFromNow(3),
    startTime: "09:00",
    endTime: "11:00",
    venueName: "晴空羽球馆",
    venueAddress: "东京墨田区本所 3-8-1",
    capacity: 4,
    signupDeadline: daysFromNow(3, 7),
    description: "适合中高级别，默认 21 分三局两胜。",
    status: EVENT_STATUS.OPEN
  });
  await insertNotice(fullEventId, "当前正式名额已满，仍可继续报名进入候补。");

  const canceledEventId = createId();
  await insertEvent({
    id: canceledEventId,
    title: "工作日晚间体验局",
    eventDate: daysFromNow(4),
    startTime: "20:00",
    endTime: "22:00",
    venueName: "樱花体育馆",
    venueAddress: "东京千代田区内神田 1-1-1",
    capacity: 10,
    signupDeadline: daysFromNow(4, 18),
    description: "本场活动已取消，仅保留展示用于测试状态流转。",
    status: EVENT_STATUS.CANCELED
  });
  await insertNotice(canceledEventId, "因场馆临时检修，本场已取消。");

  await insertEvent({
    id: createId(),
    title: "上周测试活动",
    eventDate: daysFromNow(-7),
    startTime: "19:00",
    endTime: "21:00",
    venueName: "旧场馆",
    venueAddress: "历史数据示例地址",
    capacity: 6,
    signupDeadline: daysFromNow(-7, 15),
    description: "用于演示已结束活动。",
    status: EVENT_STATUS.ENDED
  });

  for (const user of users.slice(0, 4)) {
    await insertRegistration({
      eventId: openEventId,
      userId: user.id,
      status: REGISTRATION_STATUS.CONFIRMED,
      waitlistPosition: null
    });
  }

  for (const user of users.slice(0, 4)) {
    await insertRegistration({
      eventId: fullEventId,
      userId: user.id,
      status: REGISTRATION_STATUS.CONFIRMED,
      waitlistPosition: null
    });
  }

  await insertRegistration({
    eventId: fullEventId,
    userId: users[4].id,
    status: REGISTRATION_STATUS.WAITLIST,
    waitlistPosition: 1
  });
  await insertRegistration({
    eventId: fullEventId,
    userId: users[5].id,
    status: REGISTRATION_STATUS.WAITLIST,
    waitlistPosition: 2
  });

  console.log("Seed completed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
