import type { EventStatus, RegistrationStatus } from "@/lib/constants";

export type EventSummary = {
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
  notice: string | null;
  status: EventStatus;
  displayStatus: string;
  confirmedCount: number;
  waitlistCount: number;
  remainingSpots: number;
  canRegister: boolean;
  deadlinePassed: boolean;
  ended: boolean;
};

export type RegistrationView = {
  id: string;
  name: string;
  status: RegistrationStatus;
  createdAt: string;
  canceledAt: string | null;
  waitlistPosition: number | null;
};

export type EventDetail = EventSummary & {
  confirmedList: RegistrationView[];
  waitlistList: RegistrationView[];
};
