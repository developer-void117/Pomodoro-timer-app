"use client";
import { useEffect, useState } from "react";
import FocusTimer from "./FocusTimer";
import ProgressChart from "./ProgressChart";

const reminderQuotes = [
  "Focus on what matters now, not the whole week at once.",
  "Small steps, done consistently, create real momentum.",
  "Your next session is the easiest version of your future self.",
  "A calm start often creates the strongest finish.",
  "One focused block is enough to change the shape of your day.",
];

const reminderIntervalMs = 2 * 60 * 1000;

function displayDuration(seconds: number) { const minutes = Math.floor(seconds / 60); const remainder = seconds % 60; return minutes ? `${minutes}m ${remainder}s` : `${remainder}s`; }

export default function DashboardPanel({ initialTodaySeconds, initialWeekSeconds, chartData }: { initialTodaySeconds: number; initialWeekSeconds: number; chartData: { day: string; minutes: number }[] }) {
  const [todaySeconds, setTodaySeconds] = useState(initialTodaySeconds);
  const [weekSeconds, setWeekSeconds] = useState(initialWeekSeconds);
  const [chartValues, setChartValues] = useState(chartData);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIsFading(true);
      window.setTimeout(() => {
        setQuoteIndex((current) => (current + 1) % reminderQuotes.length);
        setIsFading(false);
      }, 220);
    }, reminderIntervalMs);

    return () => window.clearInterval(timer);
  }, []);

  function sessionSaved(seconds: number, savedAt: Date = new Date()) {
    const dayKey = savedAt.toLocaleDateString("en-US", { weekday: "short" });
    setTodaySeconds((value) => value + seconds);
    setWeekSeconds((value) => value + seconds);
    setChartValues((current) =>
      current.map((item) =>
        item.day === dayKey ? { ...item, minutes: Number((item.minutes + seconds / 60).toFixed(2)) } : item,
      ),
    );
  }

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(330px,.8fr)]">
      <FocusTimer onSaved={sessionSaved} />
      <div className="space-y-6">
        <section className="grid grid-cols-2 gap-4">
          <div className="card p-5">
            <p className="text-sm text-slate-500">Today</p>
            <p className="mt-2 text-3xl font-bold">{displayDuration(todaySeconds)}</p>
            <p className="mt-2 text-sm text-moss">Focused time</p>
          </div>
          <div className="card p-5">
            <p className="text-sm text-slate-500">This week</p>
            <p className="mt-2 text-3xl font-bold">{displayDuration(weekSeconds)}</p>
            <p className="mt-2 text-sm text-moss">Total progress</p>
          </div>
        </section>
        <ProgressChart data={chartValues} />
        <section className="rounded-[28px] border border-white/40 bg-white/35 p-6 shadow-[0_12px_32px_rgba(15,23,42,0.04)] backdrop-blur-xl">
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">A tiny reminder</h2>
          <div className="relative mt-4 min-h-[90px] overflow-hidden">
            <p
              key={quoteIndex}
              className={`text-xl font-medium leading-8 text-slate-700 transition-all duration-500 ease-out ${isFading ? "translate-y-2 opacity-0" : "translate-y-0 opacity-100"}`}
            >
              {reminderQuotes[quoteIndex]}
            </p>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2">
            {reminderQuotes.map((_, index) => (
              <span
                key={index}
                className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${index === quoteIndex ? "bg-moss scale-125" : "bg-slate-300/80"}`}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
