import { getOpenAIClient, MODELS } from "./openai";
import type { TranscriptionResult } from "@/types";

export async function transcribeAudio(
  audioBuffer: Buffer,
  filename: string = "audio.webm"
): Promise<TranscriptionResult> {
  const client = getOpenAIClient();

  // Convert Buffer to ArrayBuffer explicitly
  const arrayBuffer = audioBuffer.buffer as ArrayBuffer;
  const blob = new Blob([new Uint8Array(arrayBuffer, audioBuffer.byteOffset, audioBuffer.byteLength)]);
  const file = new File([blob], filename, { type: "audio/webm" });

  const response = await client.audio.transcriptions.create({
    file,
    model: MODELS.whisper,
    response_format: "verbose_json",
    timestamp_granularities: ["segment"],
  });

  return {
    text: response.text,
    language: response.language,
    duration: response.duration,
  };
}
