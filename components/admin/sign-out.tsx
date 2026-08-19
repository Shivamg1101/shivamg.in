"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOut() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await createClient().auth.signOut();
        router.push("/admin/login");
        router.refresh();
      }}
      className="rounded-md border border-border px-3 py-1.5 text-sm font-semibold transition-colors hover:bg-secondary"
    >
      Sign out
    </button>
  );
}
