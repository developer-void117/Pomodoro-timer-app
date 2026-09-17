"use client";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();

  return (
    <button
      onClick={async () => {
        await signOut({ redirect: false });
        router.push("/");
        router.refresh();
      }}
      className="text-sm font-semibold text-slate-500 hover:text-ink"
    >
      Sign out
    </button>
  );
}
