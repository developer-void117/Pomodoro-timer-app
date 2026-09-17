import { auth } from "../../auth";
import { getCachedDashboardData } from "../../lib/focus-data";
import { redirect } from "next/navigation";
import AppNav from "../../components/AppNav";
import DashboardPanel from "../../components/DashboardPanel";

function dateKey(date: Date) {
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

export default async function Dashboard() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const user = await getCachedDashboardData(session.user.email);
  if (!user) redirect("/login");
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    return date;
  });
  const chartData = days.map((date) => ({
    day: dateKey(date),
    minutes: Number(
      (
        user.sessions
          .filter((item) => new Date(item.startedAt).toDateString() === date.toDateString())
          .reduce((total, item) => total + item.durationSeconds, 0) / 60
      ).toFixed(2),
    ),
  }));
  const todaySeconds = user.sessions
    .filter((item) => new Date(item.startedAt).toDateString() === new Date().toDateString())
    .reduce((total, item) => total + item.durationSeconds, 0);
  const weekSeconds = user.sessions.reduce((total, item) => total + item.durationSeconds, 0);
  const name = user.name || user.email.split("@")[0];
  return (
    <main className="mesh min-h-screen">
      <AppNav name={name} image={user.image} />
      <div className="mx-auto max-w-7xl px-6 py-10 pb-12">
        <p className="text-sm font-bold uppercase tracking-[.2em] text-moss">Your focus space</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Good day, {name}. Ready to begin?
        </h1>
        <DashboardPanel initialTodaySeconds={todaySeconds} initialWeekSeconds={weekSeconds} chartData={chartData} />
      </div>
    </main>
  );
}
