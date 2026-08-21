"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const NAV = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Experience", href: "/experience" },
  { label: "Projects", href: "/projects" },
  { label: "Case Studies", href: "/case-studies" },
  { label: "Blog", href: "/blog" },
];

/** Subscribes to the class the pre-paint script sets, so no state is
 *  written from an effect and server and client agree on first render. */
function subscribeTheme(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => mo.disconnect();
}

function ThemeToggle() {
  const dark = useSyncExternalStore(
    subscribeTheme,
    () => document.documentElement.classList.contains("dark"),
    () => false
  );

  function toggle() {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      /* storage unavailable — theme still applies for this session */
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      className="grid h-9 w-9 place-items-center rounded-lg border border-border text-foreground transition-colors hover:bg-secondary"
    >
      {dark ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      )}
    </button>
  );
}

export function Header({ name }: { name: string }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-60 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-5 px-6">
        <Link href="/" className="group flex items-center gap-3">
          <span className="relative block h-9 w-9 flex-none rounded-full bg-gradient-to-br from-primary to-blue-600 p-[1.5px] transition-transform duration-300 group-hover:scale-105">
            <Image
              src="/shivam.png"
              alt=""
              width={72}
              height={72}
              priority
              className="h-full w-full rounded-full object-cover"
            />
          </span>
          <span className="text-base font-extrabold tracking-tight">{name}</span>
        </Link>

        {/* desktop / tablet nav */}
        <nav className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV.map((n) => {
              const active = isActive(n.href);
              return (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    aria-current={active ? "page" : undefined}
                    className={`relative rounded-lg px-3 py-2 text-sm font-semibold transition-colors duration-200 lg:px-4 lg:text-[15px] ${
                      active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {n.label}
                    {active &&
                      (reduce ? (
                        <span className="absolute inset-x-3 -bottom-[9px] h-0.5 rounded-full bg-primary lg:inset-x-4" />
                      ) : (
                        <motion.span
                          layoutId="nav-active"
                          className="absolute inset-x-3 -bottom-[9px] h-0.5 rounded-full bg-primary lg:inset-x-4"
                          transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        />
                      ))}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          <Link
            href="/contact"
            className="hidden rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:inline-flex"
          >
            Get in Touch
          </Link>

          {/* mobile menu trigger */}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="grid h-9 w-9 place-items-center rounded-lg border border-border text-foreground transition-colors hover:bg-secondary md:hidden"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              {open ? (
                <path d="M18 6 6 18M6 6l12 12" />
              ) : (
                <path d="M3 6h18M3 12h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.button
              aria-label="Close menu"
              tabIndex={-1}
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 top-16 z-40 cursor-default bg-background/60 backdrop-blur-sm md:hidden"
            />
            <motion.nav
              id="mobile-menu"
              initial={reduce ? false : { opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
              className="absolute inset-x-0 top-16 z-50 border-b border-border bg-background px-6 pb-5 pt-2 shadow-xl md:hidden"
            >
              <ul className="grid">
                {NAV.map((n) => {
                  const active = isActive(n.href);
                  return (
                    <li key={n.href}>
                      <Link
                        href={n.href}
                        onClick={() => setOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={`flex items-center justify-between border-b border-border/60 py-3.5 text-base font-semibold transition-colors ${
                          active ? "text-primary" : "text-foreground hover:text-primary"
                        }`}
                      >
                        {n.label}
                        {active && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="mt-5 flex justify-center rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Get in Touch
              </Link>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
