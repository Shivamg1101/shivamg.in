import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { COLLECTIONS, COLLECTION_KEYS } from "@/lib/admin-schema";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const supabase = await createClient();

  const counts = await Promise.all(
    COLLECTION_KEYS.map(async (k) => {
      const { count } = await supabase
        .from(COLLECTIONS[k].table)
        .select("*", { count: "exact", head: true });
      return [k, count ?? 0] as const;
    })
  );

  const { count: unread } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("read", false);

  return (
    <>
      <div className="mb-7">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Everything on the public site is edited from here.
        </p>
      </div>

      {unread ? (
        <div className="mb-6 rounded-md border border-primary/30 bg-accent px-4 py-3 text-sm font-medium text-accent-foreground">
          You have {unread} unread {unread === 1 ? "message" : "messages"} —{" "}
          <Link href="/admin/messages" className="underline">
            read them
          </Link>
          .
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {counts.map(([key, count]) => (
          <Link
            key={key}
            href={`/admin/${key}`}
            className="card-hover group rounded-md border border-border bg-card p-5"
          >
            <div className="text-2xl font-extrabold tabular-nums transition-colors group-hover:text-primary">
              {count}
            </div>
            <div className="mt-1 text-sm font-semibold">{COLLECTIONS[key].label}</div>
          </Link>
        ))}
      </div>
    </>
  );
}
