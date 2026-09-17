import Link from "next/link";
import AuthForm from "../../components/AuthForm";
export default function LoginPage() {
  return (
    <main className="mesh grid min-h-screen place-items-center p-6">
      <section className="card w-full max-w-md p-8 sm:p-10">
        <Link href="/" className="text-xl font-bold tracking-tight">
          focus<span className="text-moss">flow</span>
        </Link>
        <h1 className="mt-10 text-3xl font-bold tracking-tight">Welcome back</h1>
        <p className="mt-2 text-slate-600">Sign in and make space for your best work.</p>
        <AuthForm mode="login" />
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
