import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Header } from "@/components/layout/Header";
import { AssistantChat } from "@/components/features/AssistantChat";

export default async function AssistantPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/");
  }

  return (
    <AppShell>
      <Header
        title="AI Assistant"
        description="Chat with AURA about your memories and life"
      />
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <AssistantChat />
      </div>
    </AppShell>
  );
}
