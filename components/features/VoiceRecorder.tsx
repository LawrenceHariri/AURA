"use client";

import { useState, useRef, useCallback } from "react";
import { Mic, MicOff, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface RecordingResult {
  memoryId: string;
  transcript: string;
  summary: string;
  tasksExtracted: number;
  appointmentsExtracted: number;
}

interface VoiceRecorderProps {
  onRecordingComplete?: (result: RecordingResult) => void;
}

export function VoiceRecorder({ onRecordingComplete }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RecordingResult | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setResult(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        await uploadAudio(blob, "recording.webm");
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
    } catch (err) {
      setError("Microphone access denied. Please allow microphone access.");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  }, [isRecording]);

  const uploadAudio = async (blob: Blob, filename: string) => {
    try {
      const formData = new FormData();
      formData.append("audio", blob, filename);

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Transcription failed");
      }

      setResult(data);
      onRecordingComplete?.(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to process recording"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setResult(null);
    setIsProcessing(true);
    await uploadAudio(file, file.name);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center gap-6">
          {/* Record button */}
          <div className="relative">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
              className={cn(
                "w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-violet-500/30",
                isRecording
                  ? "bg-red-600 hover:bg-red-500 shadow-[0_0_40px_rgba(239,68,68,0.4)] scale-110"
                  : isProcessing
                  ? "bg-zinc-700 cursor-not-allowed"
                  : "bg-violet-600 hover:bg-violet-500 shadow-[0_0_30px_rgba(124,58,237,0.3)] hover:scale-105"
              )}
            >
              {isProcessing ? (
                <Loader2 className="w-10 h-10 text-white animate-spin" />
              ) : isRecording ? (
                <MicOff className="w-10 h-10 text-white" />
              ) : (
                <Mic className="w-10 h-10 text-white" />
              )}
            </button>
            {isRecording && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
            )}
          </div>

          <div className="text-center">
            <p className="text-sm font-medium text-zinc-300">
              {isProcessing
                ? "Processing your recording…"
                : isRecording
                ? "Recording… tap to stop"
                : "Tap to start recording"}
            </p>
            <p className="text-xs text-zinc-600 mt-1">
              Or upload an audio file below
            </p>
          </div>

          {/* File upload */}
          <label className="cursor-pointer">
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isProcessing || isRecording}
            />
            <Button
              variant="secondary"
              size="sm"
              disabled={isProcessing || isRecording}
              className="pointer-events-none"
            >
              <Upload className="w-4 h-4" />
              Upload audio file
            </Button>
          </label>

          {/* Error */}
          {error && (
            <div className="w-full p-3 rounded-lg bg-red-900/20 border border-red-800 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="w-full p-4 rounded-lg bg-emerald-900/20 border border-emerald-800 space-y-2">
              <p className="text-sm font-medium text-emerald-400">
                ✓ Memory saved successfully
              </p>
              <p className="text-xs text-zinc-300">{result.summary}</p>
              {(result.tasksExtracted > 0 ||
                result.appointmentsExtracted > 0) && (
                <div className="flex gap-3 text-xs text-zinc-500">
                  {result.tasksExtracted > 0 && (
                    <span>
                      {result.tasksExtracted} task
                      {result.tasksExtracted !== 1 ? "s" : ""} extracted
                    </span>
                  )}
                  {result.appointmentsExtracted > 0 && (
                    <span>
                      {result.appointmentsExtracted} appointment
                      {result.appointmentsExtracted !== 1 ? "s" : ""} extracted
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
