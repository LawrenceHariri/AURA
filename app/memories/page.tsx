import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Header } from "@/components/layout/Header";
import { MemoriesClient } from "./MemoriesClient";

export default async function MemoriesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/");
  }

  return (
    <AppShell>
      <Header
        title="Memory Timeline"
        description="All your captured conversations and thoughts"
      />
      <main className="flex-1 p-6">
        <MemoriesClient />
      </main>
    </AppShell>
  );
}
