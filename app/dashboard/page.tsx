import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Header } from "@/components/layout/Header";
import { VoiceRecorder } from "@/components/features/VoiceRecorder";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Brain, CheckSquare, Calendar, BookOpen } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/");
  }

  const userId = session.user.id;

  const recentMemories = await prisma.memory.findMany({
    where: { userId, deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      summary: true,
      createdAt: true,
      _count: { select: { tasks: true, appointments: true } },
    },
  });

  const [memoriesCount, tasksCount, appointmentsCount] = await Promise.all([
    prisma.memory.count({ where: { userId, deletedAt: null } }),
    prisma.task.count({ where: { userId, status: "PENDING" } }),
    prisma.appointment.count({
      where: {
        userId,
        status: { in: ["DRAFT", "CONFIRMED"] },
        startTime: { gte: new Date() },
      },
    }),
  ]);

  const stats = [
    {
      label: "Total Memories",
      value: memoriesCount,
      icon: BookOpen,
      color: "text-violet-400",
      bg: "bg-violet-900/20",
    },
    {
      label: "Pending Tasks",
      value: tasksCount,
      icon: CheckSquare,
      color: "text-emerald-400",
      bg: "bg-emerald-900/20",
    },
    {
      label: "Upcoming Events",
      value: appointmentsCount,
      icon: Calendar,
      color: "text-amber-400",
      bg: "bg-amber-900/20",
    },
    {
      label: "AI Insights",
      value: memoriesCount > 0 ? "Active" : "Pending",
      icon: Brain,
      color: "text-blue-400",
      bg: "bg-blue-900/20",
    },
  ];

  return (
    <AppShell>
      <Header
        title="Dashboard"
        description={`Welcome back, ${session.user.name?.split(" ")[0] || "there"}`}
      />
      <main className="flex-1 p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} glass>
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-zinc-500 font-medium">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-zinc-100 mt-1">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-2 rounded-xl ${stat.bg}`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Voice Recorder */}
          <div>
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              Record a Memory
            </h2>
            <VoiceRecorder />
          </div>

          {/* Recent Memories */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                Recent Memories
              </h2>
              <Link
                href="/memories"
                className="text-xs text-violet-400 hover:text-violet-300"
              >
                View all →
              </Link>
            </div>
            <Card>
              <CardContent className="divide-y divide-zinc-800 py-0">
                {recentMemories.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-sm text-zinc-500">No memories yet.</p>
                    <p className="text-xs text-zinc-600 mt-1">
                      Record your first conversation to get started.
                    </p>
                  </div>
                ) : (
                  recentMemories.map((memory) => (
                    <Link
                      key={memory.id}
                      href={`/memories?id=${memory.id}`}
                      className="block py-3 hover:bg-zinc-800/50 -mx-6 px-6 transition-colors"
                    >
                      <p className="text-sm text-zinc-200 line-clamp-2">
                        {memory.summary}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-zinc-500">
                          {formatRelativeTime(memory.createdAt)}
                        </span>
                        {memory._count.tasks > 0 && (
                          <span className="text-xs text-emerald-500">
                            {memory._count.tasks} task
                            {memory._count.tasks !== 1 ? "s" : ""}
                          </span>
                        )}
                        {memory._count.appointments > 0 && (
                          <span className="text-xs text-amber-500">
                            {memory._count.appointments} event
                            {memory._count.appointments !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
