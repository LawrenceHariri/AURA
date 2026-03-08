import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { DeleteAccountButton } from "./DeleteAccountButton";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/");
  }

  const userId = session.user.id;

  const [memoriesCount, tasksCount, appointmentsCount] = await Promise.all([
    prisma.memory.count({ where: { userId, deletedAt: null } }),
    prisma.task.count({ where: { userId } }),
    prisma.appointment.count({ where: { userId } }),
  ]);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true, image: true, createdAt: true },
  });

  return (
    <AppShell>
      <Header title="Settings" description="Manage your account and preferences" />
      <main className="flex-1 p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Profile */}
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3">
                <div className="flex justify-between text-sm">
                  <dt className="text-zinc-500">Name</dt>
                  <dd className="text-zinc-200">{user?.name || "—"}</dd>
                </div>
                <div className="flex justify-between text-sm">
                  <dt className="text-zinc-500">Email</dt>
                  <dd className="text-zinc-200">{user?.email || "—"}</dd>
                </div>
                <div className="flex justify-between text-sm">
                  <dt className="text-zinc-500">Member since</dt>
                  <dd className="text-zinc-200">
                    {user?.createdAt ? formatDate(user.createdAt) : "—"}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Data summary */}
          <Card>
            <CardHeader>
              <CardTitle>Your Data</CardTitle>
              <CardDescription>Overview of your stored information</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3">
                <div className="flex justify-between text-sm">
                  <dt className="text-zinc-500">Memories</dt>
                  <dd className="text-zinc-200">{memoriesCount}</dd>
                </div>
                <div className="flex justify-between text-sm">
                  <dt className="text-zinc-500">Tasks</dt>
                  <dd className="text-zinc-200">{tasksCount}</dd>
                </div>
                <div className="flex justify-between text-sm">
                  <dt className="text-zinc-500">Appointments</dt>
                  <dd className="text-zinc-200">{appointmentsCount}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card>
            <CardHeader>
              <CardTitle>Privacy & Data</CardTitle>
              <CardDescription>
                Manage your data and privacy settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-zinc-400">
                All your data is stored securely and is never shared with third parties.
                You can delete individual memories from the Memory Timeline page.
              </p>
              <DeleteAccountButton />
            </CardContent>
          </Card>
        </div>
      </main>
    </AppShell>
  );
}
