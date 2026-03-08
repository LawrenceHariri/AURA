"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Calendar, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface IntegrationsClientProps {
  calendarConnected: boolean;
}

export function IntegrationsClient({ calendarConnected: initialConnected }: IntegrationsClientProps) {
  const searchParams = useSearchParams();
  const [connected, setConnected] = useState(initialConnected);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");
    if (success === "calendar_connected") {
      setConnected(true);
      setMessage({ type: "success", text: "Google Calendar connected successfully!" });
    } else if (error) {
      const messages: Record<string, string> = {
        calendar_denied: "Google Calendar access was denied.",
        no_code: "Authorization code not received.",
        callback_failed: "Failed to complete calendar connection.",
      };
      setMessage({
        type: "error",
        text: messages[error] || "An error occurred.",
      });
    }
  }, [searchParams]);

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {message && (
        <div
          className={`p-3 rounded-xl border flex items-center gap-2 ${
            message.type === "success"
              ? "bg-emerald-900/20 border-emerald-800 text-emerald-400"
              : "bg-red-900/20 border-red-800 text-red-400"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      {/* Google Calendar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-900/30 border border-blue-800 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <CardTitle>Google Calendar</CardTitle>
                <CardDescription>
                  Push confirmed appointments directly to your Google Calendar
                </CardDescription>
              </div>
            </div>
            <Badge variant={connected ? "success" : "default"}>
              {connected ? "Connected" : "Not connected"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-400 mb-4">
            {connected
              ? "Your Google Calendar is connected. You can now push appointments from AURA directly to your calendar."
              : "Connect your Google Calendar to automatically create events from your conversations."}
          </p>
          {connected ? (
            <div className="flex gap-2">
              <a href="/api/calendar/connect">
                <Button variant="secondary" size="sm">
                  Reconnect
                </Button>
              </a>
            </div>
          ) : (
            <a href="/api/calendar/connect">
              <Button size="sm">
                Connect Google Calendar
              </Button>
            </a>
          )}
        </CardContent>
      </Card>

      {/* More integrations placeholder */}
      <Card className="opacity-50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
              <span className="text-lg">📱</span>
            </div>
            <div>
              <CardTitle>Smart Glasses</CardTitle>
              <CardDescription>
                Connect your wearable device for automatic recording
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Badge variant="default">Coming Soon</Badge>
        </CardContent>
      </Card>
    </div>
  );
}
