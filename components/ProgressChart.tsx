"use client";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
export default function ProgressChart({ data }: { data: { day: string; minutes: number }[] }) {
  return (
    <section className="card p-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold">This week</h2>
          <p className="mt-1 text-sm text-slate-500">Minutes of focused work</p>
        </div>
        <span className="rounded-full bg-mint px-3 py-1 text-sm font-semibold text-moss">7 days</span>
      </div>
      <div className="mt-6 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="focus" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#217354" stopOpacity=".32" />
                <stop offset="100%" stopColor="#217354" stopOpacity="0" />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#76827b", fontSize: 12 }} />
            <Tooltip
              cursor={false}
              formatter={(v) => [`${v} min`, "Focus"]}
              contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 8px 24px #0001" }}
            />
            <Area type="monotone" dataKey="minutes" stroke="#217354" strokeWidth={3} fill="url(#focus)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
