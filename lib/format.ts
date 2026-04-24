import clsx from "clsx";

import { EVENT_STATUS, REGISTRATION_STATUS, type EventStatus, type RegistrationStatus } from "@/lib/constants";
import { hasEventEnded, isSignupClosed } from "@/lib/dates";

export function normalizePhone(phone: string) {
  return phone.replace(/[^\d+]/g, "").trim();
}

export function formatPhone(phone: string) {
  return phone;
}

export function getEventDisplayStatus(input: {
  status: EventStatus;
  eventDate: Date;
  startTime: string;
  endTime: string;
  signupDeadline: Date;
  confirmedCount: number;
  capacity: number;
}) {
  if (input.status === EVENT_STATUS.CANCELED) return "已取消";
  if (hasEventEnded(input)) return "已结束";
  if (input.confirmedCount >= input.capacity) return "已满";
  if (isSignupClosed(input.signupDeadline)) return "报名截止";
  return "报名中";
}

export function getRegistrationStatusLabel(status: RegistrationStatus) {
  if (status === REGISTRATION_STATUS.CONFIRMED) return "正式";
  if (status === REGISTRATION_STATUS.WAITLIST) return "候补";
  return "已取消";
}

export function cx(...values: Array<string | false | null | undefined>) {
  return clsx(values);
}
