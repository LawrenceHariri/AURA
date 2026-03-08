import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Header } from "@/components/layout/Header";
import { TasksClient } from "./TasksClient";

export default async function TasksPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/");
  }

  return (
    <AppShell>
      <Header
        title="Tasks"
        description="Tasks extracted from your conversations"
      />
      <main className="flex-1 p-6">
        <TasksClient />
      </main>
    </AppShell>
  );
}
