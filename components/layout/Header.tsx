"use client";

import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { LogOut, User } from "lucide-react";
import Image from "next/image";

interface HeaderProps {
  title: string;
  description?: string;
}

export function Header({ title, description }: HeaderProps) {
  const { data: session } = useSession();

  return (
    <header className="h-16 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-10">
      <div>
        <h1 className="text-xl font-semibold text-zinc-100">{title}</h1>
        {description && (
          <p className="text-xs text-zinc-500 mt-0.5">{description}</p>
        )}
      </div>

      {session?.user && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {session.user.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name || "User"}
                width={32}
                height={32}
                className="rounded-full border border-zinc-700"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                <User className="w-4 h-4 text-zinc-400" />
              </div>
            )}
            <span className="text-sm text-zinc-300 hidden md:block">
              {session.user.name || session.user.email}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-zinc-500 hover:text-zinc-300"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      )}
    </header>
  );
}
