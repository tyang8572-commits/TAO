export const ADMIN_COOKIE_NAME = "badminton_admin_session";

export const DEFAULT_ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
export const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "badminton123";
export const ADMIN_SECRET = process.env.ADMIN_SECRET || "badminton-dev-secret";

export const EVENT_STATUS = {
  OPEN: "OPEN",
  CANCELED: "CANCELED",
  ENDED: "ENDED"
} as const;

export const REGISTRATION_STATUS = {
  CONFIRMED: "CONFIRMED",
  WAITLIST: "WAITLIST",
  CANCELED: "CANCELED"
} as const;

export type EventStatus = (typeof EVENT_STATUS)[keyof typeof EVENT_STATUS];
export type RegistrationStatus = (typeof REGISTRATION_STATUS)[keyof typeof REGISTRATION_STATUS];
