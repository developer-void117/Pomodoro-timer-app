import Link from "next/link";
import ForgotPasswordForm from "../../components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <main className="mesh grid min-h-screen place-items-center p-6">
      <section className="card w-full max-w-md p-8 sm:p-10">
        <Link href="/" className="text-xl font-bold tracking-tight">
          focus<span className="text-moss">flow</span>
        </Link>
        <ForgotPasswordForm />
      </section>
    </main>
  );
}
