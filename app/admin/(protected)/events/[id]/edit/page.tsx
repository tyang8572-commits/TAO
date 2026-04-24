import { notFound } from "next/navigation";

import { AdminEventForm } from "@/components/admin-event-form";
import { toDateInputValue, toDateTimeLocalString } from "@/lib/dates";
import { dbGet } from "@/lib/db";

export default async function AdminEditEventPage({ params }: { params: { id: string } }) {
  const event = (await dbGet(
    `SELECT * FROM "Event" WHERE id = ?`,
    [params.id]
  )) as
    | {
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
        status: "OPEN" | "CANCELED" | "ENDED";
      }
    | undefined;

  if (!event) {
    notFound();
  }

  const date = toDateInputValue(new Date(event.eventDate));

  return (
    <AdminEventForm
      mode="edit"
      eventId={event.id}
      initialValues={{
        title: event.title,
        date,
        startTime: event.startTime,
        endTime: event.endTime,
        venueName: event.venueName,
        venueAddress: event.venueAddress,
        capacity: Number(event.capacity),
        signupDeadline: toDateTimeLocalString(new Date(event.signupDeadline)),
        description: event.description,
        status: event.status
      }}
    />
  );
}
