import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { transcribeAudio } from "@/services/transcription";
import { extractFromTranscript } from "@/services/extraction";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const audioFile = formData.get("audio") as File | null;

    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    // Validate file size (max 25MB)
    if (audioFile.size > 25 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Audio file too large (max 25MB)" },
        { status: 400 }
      );
    }

    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());

    // Transcribe
    const transcription = await transcribeAudio(
      audioBuffer,
      audioFile.name || "recording.webm"
    );

    if (!transcription.text.trim()) {
      return NextResponse.json(
        { error: "No speech detected in audio" },
        { status: 422 }
      );
    }

    // Extract structured data
    const extracted = await extractFromTranscript(transcription.text);

    // Save memory
    const memory = await prisma.memory.create({
      data: {
        userId: session.user.id,
        transcript: transcription.text,
        summary: extracted.summary,
        duration: transcription.duration,
        language: transcription.language || "en",
        metadata: extracted.metadata as object,
      },
    });

    // Save extracted tasks
    if (extracted.tasks.length > 0) {
      await prisma.task.createMany({
        data: extracted.tasks.map((task) => ({
          userId: session.user.id,
          memoryId: memory.id,
          title: task.title,
          description: task.description ?? null,
          dueDate: task.dueDate ? new Date(String(task.dueDate)) : null,
          priority: task.priority || "MEDIUM",
          status: "PENDING",
        })),
      });
    }

    // Save extracted appointments
    if (extracted.appointments.length > 0) {
      await prisma.appointment.createMany({
        data: extracted.appointments.map((appt) => ({
          userId: session.user.id,
          memoryId: memory.id,
          title: appt.title,
          description: appt.description ?? null,
          startTime: new Date(String(appt.startTime)),
          endTime: appt.endTime ? new Date(String(appt.endTime)) : null,
          location: appt.location ?? null,
          attendees: appt.attendees || [],
          status: "DRAFT",
        })),
      });
    }

    return NextResponse.json({
      memoryId: memory.id,
      transcript: transcription.text,
      summary: extracted.summary,
      metadata: extracted.metadata,
      tasksExtracted: extracted.tasks.length,
      appointmentsExtracted: extracted.appointments.length,
    });
  } catch (error) {
    console.error("Transcription error:", error);
    return NextResponse.json(
      { error: "Transcription failed" },
      { status: 500 }
    );
  }
}
