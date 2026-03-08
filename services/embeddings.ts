import { getOpenAIClient, MODELS } from "./openai";

export async function generateEmbedding(text: string): Promise<number[]> {
  const client = getOpenAIClient();

  const response = await client.embeddings.create({
    model: MODELS.embedding,
    // Truncate to ~8000 chars as a conservative approximation of the 8191-token limit
    // (tokens are typically shorter than characters; use a tokenizer for precision)
    input: text.slice(0, 8000),
  });

  return response.data[0]?.embedding || [];
}

export async function generateEmbeddings(
  texts: string[]
): Promise<number[][]> {
  const client = getOpenAIClient();

  const response = await client.embeddings.create({
    model: MODELS.embedding,
    input: texts.map((t) => t.slice(0, 8000)),
  });

  return response.data.map((d) => d.embedding);
}
