"use client";
import { useEffect, useState } from "react";
import FocusTimer from "./FocusTimer";
import ProgressChart from "./ProgressChart";

const reminderQuotes = [
  "One focused block is enough to change the shape of your day.",
  "Small steps done consistently create real momentum.",
  "Your next session is the easiest version of your future self.",
  "Focus on what matters now, not the whole week at once.",
  "A calm start often creates the strongest finish.",
];

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
      }, 180);
    }, 3500);

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
        <section className="card p-6">
          <h2 className="font-bold">A tiny reminder</h2>
          <div className="relative mt-3 min-h-[72px] overflow-hidden">
            <p
              key={quoteIndex}
              className={`text-sm leading-6 text-slate-600 transition-all duration-300 ease-out ${isFading ? "translate-y-1 opacity-0" : "translate-y-0 opacity-100"}`}
            >
              {reminderQuotes[quoteIndex]}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
