import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { chatWithAssistant } from "@/services/assistant";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { message, history = [] } = body;

    if (!message?.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Save user message
    await prisma.assistantMessage.create({
      data: {
        userId: session.user.id,
        role: "USER",
        content: message.trim(),
        memoryIds: [],
      },
    });

    // Get AI response
    const { response, memoryIds } = await chatWithAssistant(
      session.user.id,
      message.trim(),
      history
    );

    // Save assistant response
    const savedMessage = await prisma.assistantMessage.create({
      data: {
        userId: session.user.id,
        role: "ASSISTANT",
        content: response,
        memoryIds,
      },
    });

    return NextResponse.json({
      message: response,
      id: savedMessage.id,
      memoryIds,
    });
  } catch (error) {
    console.error("Assistant error:", error);
    return NextResponse.json(
      { error: "Failed to get assistant response" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const messages = await prisma.assistantMessage.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "asc" },
      take: 100,
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Get assistant messages error:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
