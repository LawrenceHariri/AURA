import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getOAuth2Client } from "@/services/calendar";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.redirect(
        new URL("/integrations?error=calendar_denied", req.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL("/integrations?error=no_code", req.url)
      );
    }

    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);

    await prisma.calendarToken.upsert({
      where: {
        userId_provider: { userId: session.user.id, provider: "google" },
      },
      create: {
        userId: session.user.id,
        provider: "google",
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token ?? null,
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        scope: tokens.scope ?? null,
      },
      update: {
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token ?? undefined,
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        scope: tokens.scope ?? null,
      },
    });

    return NextResponse.redirect(
      new URL("/integrations?success=calendar_connected", req.url)
    );
  } catch (error) {
    console.error("Calendar callback error:", error);
    return NextResponse.redirect(
      new URL("/integrations?error=callback_failed", req.url)
    );
  }
}
