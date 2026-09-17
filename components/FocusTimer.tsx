"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
type Mode = "pomodoro" | "timer";
const POMODORO_SECONDS = 25 * 60;
const format = (n: number) =>
  `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
export default function FocusTimer({ onSaved }: { onSaved?: (seconds: number) => void }) {
  const [mode, setMode] = useState<Mode>("pomodoro"),
    [seconds, setSeconds] = useState(POMODORO_SECONDS),
    [running, setRunning] = useState(false),
    [saved, setSaved] = useState(false);
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
    setSaved(false);
  }
  async function toggle() {
    if (!running) {
      startAt.current = new Date();
      segmentStartSeconds.current = seconds;
      setRunning(true);
      setSaved(false);
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
        onSaved?.(worked);
        setSaved(true);
      }
    }
  }
  function reset() {
    setRunning(false);
    setSeconds(mode === "pomodoro" ? POMODORO_SECONDS : 0);
    segmentStartSeconds.current = mode === "pomodoro" ? POMODORO_SECONDS : 0;
    setSaved(false);
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
      {saved && <p className="mt-4 text-center text-sm font-medium text-moss">Your focus time was saved.</p>}
    </section>
  );
}
