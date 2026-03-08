import { google } from "googleapis";
import { prisma } from "@/lib/prisma";

export function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

export function getAuthorizationUrl(): string {
  const oauth2Client = getOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/calendar"],
    prompt: "consent",
  });
}

export async function getCalendarClient(userId: string) {
  const calendarToken = await prisma.calendarToken.findUnique({
    where: { userId_provider: { userId, provider: "google" } },
  });

  if (!calendarToken) {
    throw new Error("Google Calendar not connected");
  }

  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: calendarToken.accessToken,
    refresh_token: calendarToken.refreshToken ?? undefined,
    expiry_date: calendarToken.expiresAt?.getTime(),
  });

  // Auto-refresh token if needed
  oauth2Client.on("tokens", async (tokens) => {
    await prisma.calendarToken.update({
      where: { userId_provider: { userId, provider: "google" } },
      data: {
        accessToken: tokens.access_token || calendarToken.accessToken,
        refreshToken: tokens.refresh_token || calendarToken.refreshToken,
        expiresAt: tokens.expiry_date
          ? new Date(tokens.expiry_date)
          : undefined,
      },
    });
  });

  return google.calendar({ version: "v3", auth: oauth2Client });
}

export async function createCalendarEvent(
  userId: string,
  event: {
    title: string;
    description?: string | null;
    startTime: Date;
    endTime?: Date | null;
    location?: string | null;
    attendees?: string[];
  }
) {
  const calendar = await getCalendarClient(userId);

  const endTime =
    event.endTime ||
    new Date(event.startTime.getTime() + 60 * 60 * 1000); // default 1 hour

  const response = await calendar.events.insert({
    calendarId: "primary",
    requestBody: {
      summary: event.title,
      description: event.description ?? undefined,
      location: event.location ?? undefined,
      start: {
        dateTime: event.startTime.toISOString(),
        timeZone: "UTC",
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: "UTC",
      },
      attendees: (event.attendees || []).map((email) => ({ email })),
    },
  });

  return response.data;
}

export async function isCalendarConnected(userId: string): Promise<boolean> {
  const token = await prisma.calendarToken.findUnique({
    where: { userId_provider: { userId, provider: "google" } },
  });
  return !!token;
}
