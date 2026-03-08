import OpenAI from "openai";
import { getOpenAIClient, MODELS } from "./openai";
import { prisma } from "@/lib/prisma";

const ASSISTANT_SYSTEM_PROMPT = `You are AURA, an AI life companion. You have access to the user's memories, notes, and life context.
Your role is to:
- Answer questions based on the user's stored memories and context
- Help them recall information, people, places, and events
- Assist with tasks and appointments
- Be warm, helpful, and concise
- Always ground your answers in the provided context
- If information is not in the provided context, say so honestly

When referencing memories, be specific about when they occurred.`;

export async function chatWithAssistant(
  userId: string,
  userMessage: string,
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>
): Promise<{ response: string; memoryIds: string[] }> {
  const client = getOpenAIClient();

  // Fetch recent memories as context
  const recentMemories = await prisma.memory.findMany({
    where: { userId, deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      summary: true,
      transcript: true,
      metadata: true,
      createdAt: true,
    },
  });

  const memoryContext = recentMemories
    .map(
      (m) =>
        `[Memory ${m.id} - ${m.createdAt.toLocaleDateString()}]: ${m.summary}`
    )
    .join("\n\n");

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `${ASSISTANT_SYSTEM_PROMPT}\n\n## User's Recent Memories:\n${memoryContext || "No memories stored yet."}`,
    },
    ...conversationHistory.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    })),
    { role: "user", content: userMessage },
  ];

  const response = await client.chat.completions.create({
    model: MODELS.chat,
    messages,
    temperature: 0.7,
    max_tokens: 1000,
  });

  const assistantResponse =
    response.choices[0]?.message?.content || "I couldn't generate a response.";

  // Find which memory IDs were likely referenced by checking if the response
  // explicitly mentions a memory ID (e.g., when the prompt includes them)
  const referencedMemoryIds = recentMemories
    .filter((m) => assistantResponse.includes(m.id))
    .map((m) => m.id);

  return {
    response: assistantResponse,
    memoryIds: referencedMemoryIds,
  };
}
