import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isCalendarConnected } from "@/services/calendar";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const googleCalendar = await isCalendarConnected(session.user.id);

    return NextResponse.json({ googleCalendar });
  } catch (error) {
    console.error("Integrations status error:", error);
    return NextResponse.json(
      { error: "Failed to get integration status" },
      { status: 500 }
    );
  }
}
