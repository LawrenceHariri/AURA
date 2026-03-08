"use client";

import { useState, useEffect } from "react";
import { Calendar, MapPin, Users, ExternalLink, Trash2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Appointment {
  id: string;
  title: string;
  description?: string | null;
  startTime: string;
  endTime?: string | null;
  location?: string | null;
  attendees: string[];
  status: "DRAFT" | "CONFIRMED" | "CANCELLED" | "PUSHED_TO_CALENDAR";
  calendarEventId?: string | null;
  createdAt: string;
  memory?: { id: string; summary: string } | null;
}

const statusBadge: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
  DRAFT: "default",
  CONFIRMED: "info",
  CANCELLED: "danger",
  PUSHED_TO_CALENDAR: "success",
};

export function AppointmentsClient() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [pushing, setPushing] = useState<string | null>(null);
  const [calendarConnected, setCalendarConnected] = useState(false);

  useEffect(() => {
    fetchAppointments();
    checkCalendarConnection();
  }, []);

  async function fetchAppointments() {
    setLoading(true);
    try {
      const res = await fetch("/api/appointments");
      const data = await res.json();
      setAppointments(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }

  async function checkCalendarConnection() {
    try {
      const res = await fetch("/api/integrations/status");
      if (res.ok) {
        const data = await res.json();
        setCalendarConnected(data.googleCalendar);
      }
    } catch {
      // ignore
    }
  }

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, status: status as Appointment["status"] } : a
        )
      );
    }
  }

  async function pushToCalendar(id: string) {
    if (!calendarConnected) {
      alert("Please connect Google Calendar in Settings > Integrations first.");
      return;
    }
    if (!confirm("Push this appointment to Google Calendar?")) return;
    setPushing(id);
    try {
      const res = await fetch("/api/calendar/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId: id }),
      });
      const data = await res.json();
      if (res.ok) {
        setAppointments((prev) =>
          prev.map((a) =>
            a.id === id
              ? { ...a, status: "PUSHED_TO_CALENDAR", calendarEventId: data.calendarEventId }
              : a
          )
        );
      } else {
        alert(data.error || "Failed to push to calendar");
      }
    } finally {
      setPushing(null);
    }
  }

  async function deleteAppointment(id: string) {
    if (!confirm("Delete this appointment?")) return;
    const res = await fetch(`/api/appointments/${id}`, { method: "DELETE" });
    if (res.ok) {
      setAppointments((prev) => prev.filter((a) => a.id !== id));
    }
  }

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {!calendarConnected && (
        <div className="p-3 rounded-xl bg-amber-900/20 border border-amber-800 flex items-center justify-between">
          <p className="text-sm text-amber-400">
            Connect Google Calendar to push events directly.
          </p>
          <a href="/integrations" className="text-xs text-amber-300 hover:underline">
            Connect →
          </a>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-zinc-500">No appointments found.</p>
          <p className="text-xs text-zinc-600 mt-1">
            Record conversations mentioning meetings or events to extract appointments automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((appt) => (
            <Card key={appt.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-sm font-semibold text-zinc-100">
                        {appt.title}
                      </h3>
                      <Badge variant={statusBadge[appt.status]}>
                        {appt.status.replace("_", " ")}
                      </Badge>
                    </div>

                    {appt.description && (
                      <p className="text-xs text-zinc-400 mb-2">{appt.description}</p>
                    )}

                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          {formatDate(appt.startTime)}
                          {appt.endTime && ` → ${formatDate(appt.endTime)}`}
                        </span>
                      </div>
                      {appt.location && (
                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{appt.location}</span>
                        </div>
                      )}
                      {appt.attendees.length > 0 && (
                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                          <Users className="w-3.5 h-3.5" />
                          <span>{appt.attendees.join(", ")}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    {appt.status === "DRAFT" && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => updateStatus(appt.id, "CONFIRMED")}
                        className="text-xs"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Confirm
                      </Button>
                    )}
                    {(appt.status === "CONFIRMED" || appt.status === "DRAFT") && (
                      <Button
                        size="sm"
                        onClick={() => pushToCalendar(appt.id)}
                        loading={pushing === appt.id}
                        className="text-xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Push to Calendar
                      </Button>
                    )}
                    <button
                      onClick={() => deleteAppointment(appt.id)}
                      className="p-1.5 rounded-lg hover:bg-red-900/30 text-zinc-600 hover:text-red-400 transition-colors self-end"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
