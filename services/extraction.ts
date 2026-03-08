import { getOpenAIClient, MODELS } from "./openai";
import type { ExtractedData, MemoryMetadata } from "@/types";

const EXTRACTION_SYSTEM_PROMPT = `You are an AI assistant that extracts structured information from conversation transcripts.
Extract the following from the provided text and return valid JSON:
- tasks: array of actionable items with title, description, dueDate (ISO string or null), priority (LOW/MEDIUM/HIGH/URGENT)
- appointments: array of scheduled events with title, description, startTime (ISO string), endTime (ISO string or null), location (string or null), attendees (array of strings)
- metadata: object with people (names mentioned), places (locations mentioned), ideas (key concepts), topics (main themes), sentiment (positive/negative/neutral)
- summary: a 2-3 sentence summary of the conversation

Return ONLY valid JSON. For dates, infer from context using today's date if needed. If no items found, return empty arrays.`;

export async function extractFromTranscript(
  transcript: string,
  currentDate: string = new Date().toISOString()
): Promise<ExtractedData> {
  const client = getOpenAIClient();

  const response = await client.chat.completions.create({
    model: MODELS.chat,
    messages: [
      { role: "system", content: EXTRACTION_SYSTEM_PROMPT },
      {
        role: "user",
        content: `Today's date: ${currentDate}\n\nTranscript:\n${transcript}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.1,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    return {
      tasks: [],
      appointments: [],
      metadata: { people: [], places: [], ideas: [], topics: [], sentiment: "neutral" },
      summary: "No content extracted.",
    };
  }

  try {
    const parsed = JSON.parse(content);
    return {
      tasks: parsed.tasks || [],
      appointments: parsed.appointments || [],
      metadata: parsed.metadata || {},
      summary: parsed.summary || "",
    };
  } catch {
    return {
      tasks: [],
      appointments: [],
      metadata: {},
      summary: transcript.slice(0, 200),
    };
  }
}

export async function summarizeMemories(
  memories: Array<{ transcript: string; summary: string; createdAt: Date }>
): Promise<string> {
  const client = getOpenAIClient();

  const memoriesText = memories
    .map((m) => `[${m.createdAt.toISOString()}] ${m.summary}`)
    .join("\n\n");

  const response = await client.chat.completions.create({
    model: MODELS.chat,
    messages: [
      {
        role: "system",
        content:
          "Provide a concise summary of the following memories, highlighting key themes, patterns, and important information.",
      },
      { role: "user", content: memoriesText },
    ],
    temperature: 0.3,
  });

  return response.choices[0]?.message?.content || "No summary available.";
}
