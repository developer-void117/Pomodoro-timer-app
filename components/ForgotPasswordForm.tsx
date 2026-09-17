"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordForm() {
  const [step, setStep] = useState<"email" | "otp" | "password">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageIsError, setMessageIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const passwordsMismatch = Boolean(confirmPassword && password !== confirmPassword);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setMessageIsError(false);
    try {
      if (step === "email") {
        const response = await fetch("/api/forgot-password/request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        if (!response.ok) throw new Error("Unable to process request.");
        setMessage("If an account exists for that email, a reset code has been sent.");
        setStep("otp");
      } else if (step === "otp") {
        const response = await fetch("/api/forgot-password/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "That code is invalid or expired.");
        setResetToken(result.resetToken);
        setMessage("");
        setStep("password");
      } else {
        if (password.length < 8) throw new Error("Use a password of at least 8 characters.");
        if (passwordsMismatch || !confirmPassword) throw new Error("Passwords do not match.");
        const response = await fetch("/api/forgot-password/reset", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, resetToken, password }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Unable to reset your password.");
        setStep("email");
        setEmail("");
        setMessage("Your password was reset. You can now sign in.");
      }
    } catch (error) {
      setMessageIsError(true);
      setMessage(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const titles = { email: "Reset your password", otp: "Enter your code", password: "Choose a new password" };
  const buttonLabels = { email: "Send reset code", otp: "Verify code", password: "Reset password" };

  return (
    <>
      <h1 className="mt-10 text-3xl font-bold tracking-tight">{titles[step]}</h1>
      <p className="mt-2 text-slate-600">
        {step === "email" && "Enter your email and we will send a one-time reset code."}
        {step === "otp" && "Enter the 6-digit code from your email. It expires in 10 minutes."}
        {step === "password" && "Set a new password for your FocusFlow account."}
      </p>
      <form onSubmit={submit} className="mt-8 space-y-4">
        {step === "email" && (
          <label className="block text-sm font-medium">
            Email address
            <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-moss" />
          </label>
        )}
        {step === "otp" && (
          <label className="block text-sm font-medium">
            6-digit code
            <input required inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 tracking-[.3em] outline-none focus:border-moss" />
          </label>
        )}
        {step === "password" && (
          <>
            <label className="block text-sm font-medium">
              New password
              <input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-moss" />
            </label>
            <label className="block text-sm font-medium">
              Confirm new password
              <input
                required
                minLength={8}
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                aria-invalid={passwordsMismatch}
                aria-describedby={passwordsMismatch ? "password-match-error" : undefined}
                className={`mt-1.5 w-full rounded-xl border bg-white px-4 py-3 outline-none focus:border-moss ${passwordsMismatch ? "border-red-400 focus:border-red-500" : "border-slate-200"}`}
              />
              {passwordsMismatch && (
                <span id="password-match-error" role="alert" className="mt-2 block text-sm font-medium text-red-600">
                  Passwords do not match.
                </span>
              )}
            </label>
          </>
        )}
        {message && <p role="alert" className={`rounded-lg px-3 py-2 text-sm ${messageIsError ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>{message}</p>}
        <button type="submit" disabled={loading} className="flex w-full items-center justify-center rounded-xl bg-moss px-4 py-3 font-semibold text-white transition hover:bg-[#185b44] disabled:cursor-wait disabled:opacity-60">
          {loading ? "Please wait..." : buttonLabels[step]}
        </button>
      </form>
      <Link className="mt-6 block text-center text-sm font-semibold text-moss" href="/login">Back to sign in</Link>
    </>
  );
}
