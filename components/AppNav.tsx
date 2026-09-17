"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import SignOutButton from "./SignOutButton";

function initials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "F"
  );
}

export default function AppNav({ name, image }: { name: string; image: string | null }) {
  const pathname = usePathname();
  const isCalendar = pathname.startsWith("/calendar");

  return (
    <header className="border-b border-[#d8e6dd] bg-white/85 shadow-[0_1px_0_rgba(24,34,30,.03)] backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/dashboard" className="text-xl font-bold tracking-tight text-ink">
          focus<span className="text-moss">flow</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-5">
          <Link
            href={isCalendar ? "/dashboard" : "/calendar"}
            aria-label={isCalendar ? "Switch to dashboard" : "Switch to calendar"}
            className="rounded-lg bg-[#f0f5f2] px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-mint hover:text-moss sm:hidden"
          >
            {isCalendar ? "Dashboard" : "Calendar"}
          </Link>
          <div className="hidden rounded-xl bg-[#f0f5f2] p-1 sm:flex">
            <Link
              className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-moss hover:shadow-sm"
              href="/dashboard"
            >
              Dashboard
            </Link>
            <Link
              className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-moss hover:shadow-sm"
              href="/calendar"
            >
              Calendar
            </Link>
          </div>
          <Link
            href="/profile"
            aria-label="Open profile settings"
            className="group flex items-center gap-2 rounded-xl px-1.5 py-1 transition hover:bg-[#f0f5f2]"
          >
            <span className="hidden max-w-24 truncate text-sm font-semibold text-slate-600 md:block">
              {name}
            </span>
            {image ? (
              <img
                className="h-9 w-9 rounded-full object-cover ring-2 ring-mint transition group-hover:ring-moss"
                src={image}
                alt="Profile"
              />
            ) : (
              <span className="grid h-9 w-9 place-items-center rounded-full bg-moss text-xs font-bold text-white ring-2 ring-mint transition group-hover:ring-moss">
                {initials(name)}
              </span>
            )}
          </Link>
          <div className="hidden h-6 w-px bg-slate-200 sm:block" />
          <SignOutButton />
        </div>
      </nav>
    </header>
  );
}
