import Link from "next/link";
export default function Home() {
  return (
    <main className="mesh min-h-screen px-6 py-8">
      <nav className="mx-auto flex max-w-6xl items-center justify-between">
        <span className="text-xl font-bold tracking-tight">
          focus<span className="text-moss">flow</span>
        </span>
        <Link
          className="rounded-xl border border-moss px-4 py-2 text-sm font-semibold text-moss"
          href="/login"
        >
          Sign in
        </Link>
      </nav>
      <section className="mx-auto max-w-4xl py-28 text-center">
        <p className="text-sm font-bold uppercase tracking-[.2em] text-moss">Make time count</p>
        <h1 className="mt-5 text-5xl font-bold tracking-tight sm:text-7xl">
          Focus deeply.
          <br />
          <span className="text-moss">Live intentionally.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-600">
          A beautiful Pomodoro timer and work journal that turns your focus into progress you can see.
        </p>
        <Link
          href="/register"
          className="mt-9 inline-block rounded-xl bg-moss px-6 py-3 font-semibold text-white shadow-soft"
        >
          Get started free
        </Link>
      </section>
    </main>
  );
}
