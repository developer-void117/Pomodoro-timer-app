"use client";
import { useState } from "react";
import FocusTimer from "./FocusTimer";
import ProgressChart from "./ProgressChart";

function displayDuration(seconds: number) { const minutes = Math.floor(seconds / 60); const remainder = seconds % 60; return minutes ? `${minutes}m ${remainder}s` : `${remainder}s`; }

export default function DashboardPanel({ initialTodaySeconds, initialWeekSeconds, chartData }: { initialTodaySeconds: number; initialWeekSeconds: number; chartData: { day: string; minutes: number }[] }) {
  const [todaySeconds, setTodaySeconds] = useState(initialTodaySeconds); const [weekSeconds, setWeekSeconds] = useState(initialWeekSeconds);
  function sessionSaved(seconds: number) { setTodaySeconds((value) => value + seconds); setWeekSeconds((value) => value + seconds); }
  return <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(330px,.8fr)]"><FocusTimer onSaved={sessionSaved} /><div className="space-y-6"><section className="grid grid-cols-2 gap-4"><div className="card p-5"><p className="text-sm text-slate-500">Today</p><p className="mt-2 text-3xl font-bold">{displayDuration(todaySeconds)}</p><p className="mt-2 text-sm text-moss">Focused time</p></div><div className="card p-5"><p className="text-sm text-slate-500">This week</p><p className="mt-2 text-3xl font-bold">{displayDuration(weekSeconds)}</p><p className="mt-2 text-sm text-moss">Total progress</p></div></section><ProgressChart data={chartData} /><section className="card p-6"><h2 className="font-bold">A tiny reminder</h2><p className="mt-2 text-sm leading-6 text-slate-600">One focused block is enough to change the shape of your day. Start small and let the momentum follow.</p></section></div></div>;
}
