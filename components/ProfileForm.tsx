"use client";
import { useRef, useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

type Props = { initialName: string; initialImage: string | null; email: string };
function Eye({ open }: { open: boolean }) {
  return open ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path d="m3 3 18 18" />
      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
      <path d="M9.9 4.2A10.7 10.7 0 0 1 12 4c5.5 0 9.3 4.5 10 8-0.3 1.5-1.3 3-2.7 4.3M6.6 6.6C4.8 8 3.5 10 2 12c1 4 5 8 10 8 1.3 0 2.5-.3 3.6-.8" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path d="M2 12s3.5-8 10-8 10 8 10 8-3.5 8-10 8S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default function ProfileForm({ initialName, initialImage, email }: Props) {
  const [name, setName] = useState(initialName),
    [image, setImage] = useState(initialImage || ""),
    [currentPassword, setCurrentPassword] = useState(""),
    [newPassword, setNewPassword] = useState(""),
    [confirmPassword, setConfirmPassword] = useState(""),
    [showCurrent, setShowCurrent] = useState(false),
    [showNew, setShowNew] = useState(false),
    [showConfirm, setShowConfirm] = useState(false),
    [message, setMessage] = useState(""),
    [uploadError, setUploadError] = useState(""),
    [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const passwordsMismatch = Boolean(confirmPassword && newPassword !== confirmPassword);
  function pickImage(file?: File) {
    if (!file) return;
    setUploadError("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setUploadError("Please choose a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > 500000) {
      setUploadError(
        `${file.name} is ${(file.size / 1024 / 1024).toFixed(1)} MB. Choose an image smaller than 500 KB.`,
      );
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result));
    reader.readAsDataURL(file);
  }
  async function save() {
    if (passwordsMismatch) {
      setMessage("Passwords do not match.");
      return;
    }
    if (newPassword && !currentPassword) {
      setMessage("Enter your current password to choose a new one.");
      return;
    }
    const passwordWasChanged = Boolean(newPassword);
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, image, currentPassword, newPassword }),
      });
      const text = await response.text();
      const result = text ? (JSON.parse(text) as { error?: string }) : {};
      if (!response.ok) {
        setMessage(
          result.error || "Unable to save your profile. Confirm the database migration has been applied.",
        );
        return;
      }
      if (passwordWasChanged) {
        await signOut({ redirect: false });
        router.replace("/login");
        router.refresh();
        return;
      }
      setMessage("Profile saved.");
      router.refresh();
    } catch {
      setMessage("Unable to save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }
  async function deleteAccount() {
    if (!confirm("Delete your account and all recorded focus sessions? This cannot be undone.")) return;
    const response = await fetch("/api/profile", { method: "DELETE" });
    if (response.ok) await signOut({ callbackUrl: "/" });
    else setMessage("Unable to delete your account. Please try again.");
  }
  const passwordInput = (
    label: string,
    value: string,
    setValue: (value: string) => void,
    visible: boolean,
    setVisible: (visible: boolean) => void,
    error = false,
  ) => (
    <label className="mt-4 block text-sm font-semibold">
      {label}
      <span className="relative mt-2 block">
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          minLength={label !== "Current password" ? 8 : undefined}
          type={visible ? "text" : "password"}
          className={`w-full rounded-xl border bg-white py-3 pl-4 pr-12 outline-none focus:border-moss ${error ? "border-red-400 focus:border-red-500" : "border-slate-200"}`}
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          className="absolute inset-y-0 right-0 grid w-12 place-items-center text-slate-400 hover:text-moss"
        >
          <Eye open={visible} />
        </button>
      </span>
    </label>
  );
  return (
    <div className="space-y-6">
      <section className="card p-6">
        <h2 className="text-lg font-bold">Your profile</h2>
        <p className="mt-1 text-sm text-slate-500">Personalize your focus space.</p>
        <div className="mt-6 flex items-center gap-5">
          {image ? (
            <img src={image} alt="Profile preview" className="h-20 w-20 rounded-full object-cover" />
          ) : (
            <span className="grid h-20 w-20 place-items-center rounded-full bg-mint text-2xl font-bold text-moss">
              {name.slice(0, 1).toUpperCase() || "F"}
            </span>
          )}
          <div>
            <input
              ref={fileRef}
              className="hidden"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => pickImage(event.target.files?.[0])}
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="rounded-xl border border-moss px-4 py-2 text-sm font-semibold text-moss"
            >
              Choose photo
            </button>
            {image && (
              <button
                onClick={() => {
                  setImage("");
                  setUploadError("");
                }}
                className="ml-3 text-sm font-semibold text-slate-500"
              >
                Remove
              </button>
            )}
            <p className="mt-2 text-xs text-slate-500">JPG, PNG, or WebP · max 500 KB</p>
            {uploadError && (
              <p
                role="alert"
                className="mt-2 max-w-sm rounded-lg bg-red-50 px-3 py-2 text-xs font-medium leading-5 text-red-700"
              >
                {uploadError}
              </p>
            )}
          </div>
        </div>
        <label className="mt-6 block text-sm font-semibold">
          Display name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={60}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-moss"
          />
        </label>
        <label className="mt-4 block text-sm font-semibold">
          Email
          <input
            value={email}
            disabled
            className="mt-2 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500"
          />
        </label>
        <div className="mt-7 border-t border-slate-100 pt-6">
          <h3 className="font-bold">Change password</h3>
          <p className="mt-1 text-sm text-slate-500">Leave these blank to keep your current password.</p>
          {passwordInput(
            "Current password",
            currentPassword,
            setCurrentPassword,
            showCurrent,
            setShowCurrent,
          )}
          {passwordInput("New password", newPassword, setNewPassword, showNew, setShowNew)}
          {passwordInput(
            "Confirm new password",
            confirmPassword,
            setConfirmPassword,
            showConfirm,
            setShowConfirm,
            passwordsMismatch,
          )}
          {passwordsMismatch && (
            <p role="alert" className="mt-2 text-sm font-medium text-red-600">
              Passwords do not match.
            </p>
          )}
        </div>
        {message && (
          <p
            className={`mt-4 text-sm font-medium ${message.includes("Unable") || message.includes("incorrect") || message.includes("match") ? "text-red-600" : "text-moss"}`}
          >
            {message}
          </p>
        )}
        <button
          disabled={saving || passwordsMismatch}
          onClick={save}
          className="mt-6 rounded-xl bg-moss px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </section>
      <section className="rounded-3xl border border-red-200 bg-red-50 p-6">
        <h2 className="font-bold text-red-900">Danger zone</h2>
        <p className="mt-2 text-sm leading-6 text-red-800">
          Deleting your account permanently removes your profile and every saved focus session.
        </p>
        <button
          onClick={deleteAccount}
          className="mt-4 rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700"
        >
          Delete account
        </button>
      </section>
    </div>
  );
}
