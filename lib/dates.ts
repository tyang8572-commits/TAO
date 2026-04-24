import { EVENT_STATUS, type EventStatus } from "@/lib/constants";

type EventTimeLike = {
  eventDate: Date;
  startTime: string;
  endTime: string;
  status: EventStatus;
};

export function toDateTimeLocalString(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function combineDateAndTime(date: Date, time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const next = new Date(date);
  next.setHours(hours, minutes, 0, 0);
  return next;
}

export function hasEventEnded(event: EventTimeLike, now = new Date()) {
  if (event.status === EVENT_STATUS.ENDED) return true;
  return combineDateAndTime(event.eventDate, event.endTime).getTime() < now.getTime();
}

export function hasEventStarted(event: Pick<EventTimeLike, "eventDate" | "startTime">, now = new Date()) {
  return combineDateAndTime(event.eventDate, event.startTime).getTime() <= now.getTime();
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    weekday: "short"
  }).format(date);
}

export function formatDateLong(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short"
  }).format(date);
}

export function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}
