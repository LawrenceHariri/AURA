import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCalendarEvent, isCalendarConnected } from "@/services/calendar";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const connected = await isCalendarConnected(session.user.id);
    if (!connected) {
      return NextResponse.json(
        { error: "Google Calendar not connected" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { appointmentId } = body;

    if (!appointmentId) {
      return NextResponse.json(
        { error: "Appointment ID required" },
        { status: 400 }
      );
    }

    const appointment = await prisma.appointment.findFirst({
      where: { id: appointmentId, userId: session.user.id },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    if (appointment.status === "PUSHED_TO_CALENDAR") {
      return NextResponse.json(
        { error: "Appointment already pushed to calendar" },
        { status: 400 }
      );
    }

    // Create the event in Google Calendar
    const calendarEvent = await createCalendarEvent(session.user.id, {
      title: appointment.title,
      description: appointment.description,
      startTime: appointment.startTime,
      endTime: appointment.endTime ?? undefined,
      location: appointment.location,
      attendees: appointment.attendees,
    });

    // Update appointment status
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: "PUSHED_TO_CALENDAR",
        calendarEventId: calendarEvent.id ?? null,
      },
    });

    return NextResponse.json({
      success: true,
      calendarEventId: calendarEvent.id,
      htmlLink: calendarEvent.htmlLink,
    });
  } catch (error) {
    console.error("Push to calendar error:", error);
    return NextResponse.json(
      { error: "Failed to push event to calendar" },
      { status: 500 }
    );
  }
}
