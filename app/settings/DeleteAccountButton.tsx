"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { useState } from "react";

export function DeleteAccountButton() {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="p-3 rounded-xl bg-red-900/20 border border-red-800 space-y-3">
        <p className="text-sm text-red-400">
          This will permanently delete your account and all associated data. This cannot be undone.
        </p>
        <div className="flex gap-2">
          <Button
            variant="danger"
            size="sm"
            onClick={async () => {
              const res = await fetch("/api/user", { method: "DELETE" });
              if (res.ok) {
                signOut({ callbackUrl: "/" });
              }
            }}
          >
            Yes, delete my account
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button variant="danger" size="sm" onClick={() => setConfirming(true)}>
      Delete Account
    </Button>
  );
}
