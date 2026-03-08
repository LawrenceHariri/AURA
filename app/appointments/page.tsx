import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Header } from "@/components/layout/Header";
import { AppointmentsClient } from "./AppointmentsClient";

export default async function AppointmentsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/");
  }

  return (
    <AppShell>
      <Header
        title="Appointments"
        description="Calendar events extracted from your conversations"
      />
      <main className="flex-1 p-6">
        <AppointmentsClient />
      </main>
    </AppShell>
  );
}
