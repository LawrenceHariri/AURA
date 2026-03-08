import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SignInButton } from "@/components/features/SignInButton";
import { Sparkles, Mic, Brain, Calendar, Search } from "lucide-react";

export default async function LandingPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-950/30 via-zinc-950 to-zinc-950 pointer-events-none" />

      <div className="relative z-10 text-center max-w-2xl mx-auto">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 rounded-3xl bg-violet-600 flex items-center justify-center shadow-[0_0_60px_rgba(124,58,237,0.4)]">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-6xl font-bold text-zinc-100 tracking-tight mb-4">
          AURA
        </h1>
        <p className="text-xl text-zinc-400 mb-12">
          Your AI life companion
        </p>

        {/* Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { icon: Mic, label: "Voice Recording" },
            { icon: Brain, label: "AI Extraction" },
            { icon: Search, label: "Searchable Memory" },
            { icon: Calendar, label: "Calendar Sync" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800"
            >
              <Icon className="w-5 h-5 text-violet-400" />
              <span className="text-xs text-zinc-400">{label}</span>
            </div>
          ))}
        </div>

        {/* Sign in */}
        <SignInButton />

        <p className="text-xs text-zinc-600 mt-6">
          Sign in with Google to get started. Your data is private and secure.
        </p>
      </div>
    </main>
  );
}
