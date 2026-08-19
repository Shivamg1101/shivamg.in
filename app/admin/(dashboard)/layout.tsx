import Link from "next/link";
import { COLLECTIONS, COLLECTION_KEYS } from "@/lib/admin-schema";
import { SignOut } from "@/components/admin/sign-out";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-5 px-6">
          <Link href="/admin" className="text-sm font-extrabold tracking-tight">
            Portfolio CMS
          </Link>
          <nav className="hidden gap-4 md:flex">
            {COLLECTION_KEYS.map((k) => (
              <Link
                key={k}
                href={`/admin/${k}`}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {COLLECTIONS[k].label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              View site ↗
            </Link>
            <SignOut />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
