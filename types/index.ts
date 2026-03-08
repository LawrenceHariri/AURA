export interface Memory {
  id: string;
  userId: string;
  deviceId?: string | null;
  transcript: string;
  summary: string;
  rawAudio?: string | null;
  duration?: number | null;
  language: string;
  metadata: MemoryMetadata;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface MemoryMetadata {
  people?: string[];
  places?: string[];
  ideas?: string[];
  topics?: string[];
  sentiment?: "positive" | "negative" | "neutral";
}

export interface Task {
  id: string;
  userId: string;
  memoryId?: string | null;
  title: string;
  description?: string | null;
  dueDate?: Date | null;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  createdAt: Date;
  updatedAt: Date;
}

export interface Appointment {
  id: string;
  userId: string;
  memoryId?: string | null;
  title: string;
  description?: string | null;
  startTime: Date;
  endTime?: Date | null;
  location?: string | null;
  attendees: string[];
  status: "DRAFT" | "CONFIRMED" | "CANCELLED" | "PUSHED_TO_CALENDAR";
  calendarEventId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssistantMessage {
  id: string;
  userId: string;
  role: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
  memoryIds: string[];
  createdAt: Date;
}

export interface CalendarToken {
  id: string;
  userId: string;
  provider: string;
  accessToken: string;
  refreshToken?: string | null;
  expiresAt?: Date | null;
  scope?: string | null;
}

export interface ExtractedData {
  tasks: Omit<Task, "id" | "userId" | "createdAt" | "updatedAt">[];
  appointments: Omit<Appointment, "id" | "userId" | "createdAt" | "updatedAt">[];
  metadata: MemoryMetadata;
  summary: string;
}

export interface TranscriptionResult {
  text: string;
  language?: string;
  duration?: number;
}
