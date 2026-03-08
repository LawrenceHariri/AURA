import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Header } from "@/components/layout/Header";
import { IntegrationsClient } from "./IntegrationsClient";
import { isCalendarConnected } from "@/services/calendar";

export default async function IntegrationsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/");
  }

  const calendarConnected = await isCalendarConnected(session.user.id);

  return (
    <AppShell>
      <Header title="Integrations" description="Connect your external services" />
      <main className="flex-1 p-6">
        <IntegrationsClient calendarConnected={calendarConnected} />
      </main>
    </AppShell>
  );
}
