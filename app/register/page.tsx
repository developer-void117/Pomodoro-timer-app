import Link from "next/link";
import AuthForm from "../../components/AuthForm";
export default function RegisterPage() {
  return (
    <main className="mesh grid min-h-screen place-items-center p-6">
      <section className="card w-full max-w-md p-8 sm:p-10">
        <Link href="/" className="text-xl font-bold tracking-tight">
          focus<span className="text-moss">flow</span>
        </Link>
        <h1 className="mt-10 text-3xl font-bold tracking-tight">Start your focus habit</h1>
        <p className="mt-2 text-slate-600">A calmer way to build meaningful momentum.</p>
        <AuthForm mode="register" />
        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link className="font-semibold text-moss" href="/login">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
