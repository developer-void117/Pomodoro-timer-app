"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
type Mode = "pomodoro" | "timer";
const POMODORO_SECONDS = 25 * 60;
const format = (n: number) =>
  `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  if (minutes && remainder) return `${minutes}m ${remainder}s`;
  if (minutes) return `${minutes}m`;
  return `${remainder}s`;
};
export default function FocusTimer({ onSaved }: { onSaved?: (seconds: number, savedAt?: Date) => void }) {
  const [mode, setMode] = useState<Mode>("pomodoro"),
    [seconds, setSeconds] = useState(POMODORO_SECONDS),
    [running, setRunning] = useState(false),
    [manualMinutes, setManualMinutes] = useState(0),
    [manualSeconds, setManualSeconds] = useState(0),
    [statusMessage, setStatusMessage] = useState("");
  const startAt = useRef<Date | null>(null),
    segmentStartSeconds = useRef(POMODORO_SECONDS),
    modeRef = useRef<Mode>("pomodoro");
  modeRef.current = mode;
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(
      () =>
        setSeconds((s) => {
          const next = modeRef.current === "pomodoro" ? s - 1 : s + 1;
          if (modeRef.current === "pomodoro" && next <= 0) {
            window.clearInterval(id);
            setRunning(false);
            return 0;
          }
          return next;
        }),
      1000,
    );
    return () => window.clearInterval(id);
  }, [running]);
  function switchMode(next: Mode) {
    if (running) return;
    setMode(next);
    setSeconds(next === "pomodoro" ? POMODORO_SECONDS : 0);
    segmentStartSeconds.current = next === "pomodoro" ? POMODORO_SECONDS : 0;
    setStatusMessage("");
  }
  async function addManualTime() {
    const totalSeconds = manualMinutes * 60 + manualSeconds;
    if (totalSeconds <= 0) {
      setStatusMessage("Choose at least 1 second to add.");
      return;
    }
    const now = new Date();
    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "TIMER",
          durationSeconds: totalSeconds,
          startedAt: now,
          endedAt: now,
        }),
      });
      if (!response.ok) {
        setStatusMessage("Unable to add time. Please try again.");
        return;
      }
      onSaved?.(totalSeconds, now);
      setManualMinutes(0);
      setManualSeconds(0);
      setStatusMessage(`Added ${formatDuration(totalSeconds)} to your focus total.`);
    } catch {
      setStatusMessage("Unable to add time. Please try again.");
    }
  }
  async function toggle() {
    if (!running) {
      startAt.current = new Date();
      segmentStartSeconds.current = seconds;
      setRunning(true);
      setStatusMessage("");
      return;
    }
    setRunning(false);
    const worked = mode === "pomodoro" ? segmentStartSeconds.current - seconds : seconds - segmentStartSeconds.current;
    if (worked > 0) {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: mode === "pomodoro" ? "POMODORO" : "TIMER",
          durationSeconds: worked,
          startedAt: startAt.current,
          endedAt: new Date(),
        }),
      });
      if (response.ok) {
        onSaved?.(worked, startAt.current ?? new Date());
        setStatusMessage("Your focus time was saved.");
      }
    }
  }
  function reset() {
    setRunning(false);
    setSeconds(mode === "pomodoro" ? POMODORO_SECONDS : 0);
    segmentStartSeconds.current = mode === "pomodoro" ? POMODORO_SECONDS : 0;
    setStatusMessage("");
  }
  const displayed = mode === "pomodoro" ? seconds : seconds;
  const progress =
    mode === "pomodoro"
      ? ((POMODORO_SECONDS - seconds) / POMODORO_SECONDS) * 100
      : Math.min((seconds / 3600) * 100, 100);
  return (
    <section className="card p-6 sm:p-8">
      <div className="flex rounded-xl bg-[#edf3ef] p-1 text-sm font-semibold">
        <button
          onClick={() => switchMode("pomodoro")}
          className={`flex-1 rounded-lg px-3 py-2 ${mode === "pomodoro" ? "bg-white text-moss shadow-sm" : "text-slate-500"}`}
        >
          Pomodoro
        </button>
        <button
          onClick={() => switchMode("timer")}
          className={`flex-1 rounded-lg px-3 py-2 ${mode === "timer" ? "bg-white text-moss shadow-sm" : "text-slate-500"}`}
        >
          Open timer
        </button>
      </div>
      <div className="my-8 flex justify-center">
        <div
          className="ring grid h-56 w-56 place-items-center rounded-full"
          style={{ "--progress": `${progress}%` } as CSSProperties}
        >
          <div className="grid h-[calc(100%-18px)] w-[calc(100%-18px)] place-items-center rounded-full bg-white">
            <div className="text-center">
              <p className="font-mono text-5xl font-bold tracking-tight">{format(displayed)}</p>
              <p className="mt-2 text-sm text-slate-500">
                {mode === "pomodoro" ? "Focus session" : "Free-form focus"}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-center gap-3">
        <button
          onClick={reset}
          className="rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-600"
        >
          Reset
        </button>
        <button onClick={toggle} className="min-w-32 rounded-xl bg-moss px-5 py-3 font-semibold text-white">
          {running ? "Stop & save" : "Start focus"}
        </button>
      </div>
      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-semibold text-slate-700">Add time</h3>
          <span className="text-sm font-medium text-moss">{formatDuration(manualMinutes * 60 + manualSeconds)}</span>
        </div>
        <div className="mt-4">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[.18em] text-slate-500">
            Minutes
          </label>
          <input
            type="range"
            min={0}
            max={120}
            value={manualMinutes}
            onChange={(event) => setManualMinutes(Number(event.target.value))}
            className="h-2 w-full cursor-pointer accent-moss"
          />
          <div className="mt-1 flex justify-between text-xs text-slate-500">
            <span>0m</span>
            <span>{manualMinutes}m</span>
            <span>120m</span>
          </div>
        </div>
        <div className="mt-4">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[.18em] text-slate-500">
            Seconds
          </label>
          <input
            type="range"
            min={0}
            max={59}
            value={manualSeconds}
            onChange={(event) => setManualSeconds(Number(event.target.value))}
            className="h-2 w-full cursor-pointer accent-moss"
          />
          <div className="mt-1 flex justify-between text-xs text-slate-500">
            <span>0s</span>
            <span>{manualSeconds}s</span>
            <span>59s</span>
          </div>
        </div>
        <button
          onClick={addManualTime}
          className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-700"
        >
          Add
        </button>
      </div>
      {statusMessage && <p className="mt-4 text-center text-sm font-medium text-moss">{statusMessage}</p>}
    </section>
  );
}
