"use client";
import { signOut } from "next-auth/react";
export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-sm font-semibold text-slate-500 hover:text-ink"
    >
      Sign out
    </button>
  );
}
