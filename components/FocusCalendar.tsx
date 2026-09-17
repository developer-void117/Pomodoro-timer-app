"use client";
import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
type Session = { id: string; durationSeconds: number; type: "POMODORO" | "TIMER"; startedAt: string };
const key = (date: Date) => date.toISOString().slice(0, 10);
const displayDuration = (seconds: number) =>
  seconds >= 60 ? `${Math.floor(seconds / 60)}m ${seconds % 60}s` : `${seconds}s`;

export default function FocusCalendar() {
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selected, setSelected] = useState(key(new Date()));
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    fetch(`/api/calendar?year=${month.getFullYear()}&month=${month.getMonth()}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load this month.");
        setSessions(await response.json());
      })
      .catch((reason) => {
        if (reason.name !== "AbortError") setError("Unable to load this month. Please try again.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [month]);
  const byDate = useMemo(
    () =>
      sessions.reduce<Record<string, Session[]>>((result, item) => {
        const itemKey = key(new Date(item.startedAt));
        (result[itemKey] ||= []).push(item);
        return result;
      }, {}),
    [sessions],
  );
  const days = useMemo(() => {
    const start = new Date(month);
    start.setDate(1 - start.getDay());
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return date;
    });
  }, [month]);
  const selectedSessions = byDate[selected] || [];
  const totalSeconds = selectedSessions.reduce((sum, item) => sum + item.durationSeconds, 0);
  const chartData = selectedSessions.map((item, index) => ({
    label: `Session ${index + 1}`,
    seconds: item.durationSeconds,
  }));
  function moveMonth(offset: number) {
    const next = new Date(month.getFullYear(), month.getMonth() + offset, 1);
    setMonth(next);
    setSelected(key(next));
  }
  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
      <section className="card p-5 sm:p-7">
        <div className="flex items-center justify-between">
          <button
            onClick={() => moveMonth(-1)}
            aria-label="Previous month"
            className="grid h-9 w-9 place-items-center rounded-lg hover:bg-mint"
          >
            &larr;
          </button>
          <h2 className="text-lg font-bold">
            {month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </h2>
          <button
            onClick={() => moveMonth(1)}
            aria-label="Next month"
            className="grid h-9 w-9 place-items-center rounded-lg hover:bg-mint"
          >
            &rarr;
          </button>
        </div>
        <div className="mt-6 grid grid-cols-7 text-center text-xs font-semibold text-slate-400">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
        <div className={`mt-2 grid grid-cols-7 gap-1 transition ${loading ? "opacity-50" : ""}`}>
          {days.map((date) => {
            const dateKey = key(date);
            const active = dateKey === selected;
            const inMonth = date.getMonth() === month.getMonth();
            const hasFocus = (byDate[dateKey] || []).length > 0;
            return (
              <button
                key={dateKey}
                disabled={loading}
                onClick={() => setSelected(dateKey)}
                className={`relative aspect-square rounded-xl text-sm transition ${active ? "bg-moss font-bold text-white" : inMonth ? "hover:bg-mint" : "text-slate-300"}`}
              >
                <span>{date.getDate()}</span>
                {hasFocus && (
                  <span
                    className={`absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full ${active ? "bg-white" : "bg-moss"}`}
                  />
                )}
              </button>
            );
          })}
        </div>
        <p className="mt-5 text-sm text-slate-500">
          {loading
            ? "Loading focus history..."
            : error || (
                <>
                  <span className="mr-2 inline-block h-2 w-2 rounded-full bg-moss" />A dot means you recorded
                  focus time.
                </>
              )}
        </p>
      </section>
      <section className="card p-6">
        <p className="text-sm font-semibold text-moss">
          {new Date(`${selected}T12:00:00`).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
        <h2 className="mt-2 text-4xl font-bold">{loading ? "..." : displayDuration(totalSeconds)}</h2>
        <p className="mt-1 text-sm text-slate-500">of focused work</p>
        {chartData.length && !loading ? (
          <div className="mt-7 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#718078" }}
                />
                <YAxis hide />
                <Tooltip
                  formatter={(value) => [displayDuration(Number(value)), "Focus"]}
                  cursor={{ fill: "#edf5ef" }}
                />
                <Bar dataKey="seconds" fill="#217354" radius={[7, 7, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="mt-7 grid h-52 place-items-center rounded-2xl bg-[#f3f7f4] px-5 text-center text-sm leading-6 text-slate-500">
            {loading
              ? "Loading this month..."
              : "No focus sessions recorded on this date. Choose another day or start a timer."}
          </div>
        )}
        <p className="mt-4 text-sm text-slate-500">
          {selectedSessions.length} {selectedSessions.length === 1 ? "session" : "sessions"} recorded
        </p>
      </section>
    </div>
  );
}
