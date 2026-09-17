import Link from "next/link";
import AuthForm from "../../components/AuthForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ deleted?: string }>;
}) {
  const deleted = (await searchParams)?.deleted === "1";

  return (
    <main className="mesh grid min-h-screen place-items-center p-6">
      <section className="card w-full max-w-md p-8 sm:p-10">
        <Link href="/" className="text-xl font-bold tracking-tight">
          focus<span className="text-moss">flow</span>
        </Link>
        <h1 className="mt-10 text-3xl font-bold tracking-tight">Welcome back</h1>
        <p className="mt-2 text-slate-600">Sign in and make space for your best work.</p>
        {deleted && (
          <p className="mt-4 rounded-lg border border-moss/20 bg-moss/5 px-3 py-2 text-sm font-medium text-moss">
            Your account has been deleted. You can create a new account or sign in again.
          </p>
        )}
        <AuthForm mode="login" />
        <Link className="mt-4 block text-center text-sm font-semibold text-moss" href="/forgot-password">
          Forgot Password?
        </Link>
        <p className="mt-6 text-center text-sm text-slate-600">
          New here?{" "}
          <Link className="font-semibold text-moss" href="/register">
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
}
