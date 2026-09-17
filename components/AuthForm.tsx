"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  async function submit(form: FormData) {
    setLoading(true);
    setError("");
    const email = String(form.get("email"));
    const password = String(form.get("password"));
    if (mode === "register") {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.get("name"), email, password }),
      });
      if (!res.ok) {
        setError((await res.json()).error);
        setLoading(false);
        return;
      }
    }
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void submit(new FormData(event.currentTarget));
      }}
      className="mt-8 space-y-4"
    >
      {mode === "register" && (
        <label className="block text-sm font-medium">
          Name
          <input
            name="name"
            placeholder="Alex Morgan"
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-moss"
          />
        </label>
      )}
      <label className="block text-sm font-medium">
        Email address
        <input
          required
          type="email"
          name="email"
          placeholder="you@example.com"
          className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-moss"
        />
      </label>
      <label className="block text-sm font-medium">
        Password
        <input
          required
          minLength={8}
          type="password"
          name="password"
          placeholder="At least 8 characters"
          className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-moss"
        />
      </label>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        aria-busy={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-moss px-4 py-3 font-semibold text-white transition hover:bg-[#185b44] disabled:cursor-wait disabled:opacity-60"
      >
        {loading && (
          <svg aria-hidden="true" className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-30" cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" />
            <path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        )}
        {loading ? "Signing you in..." : mode === "login" ? "Sign in" : "Create my account"}
      </button>
    </form>
  );
}
