import { auth } from "../../auth";
import { getCachedNavigationUser } from "../../lib/focus-data";
import { redirect } from "next/navigation";
import AppNav from "../../components/AppNav";
import ProfileForm from "../../components/ProfileForm";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  const user = await getCachedNavigationUser(session.user.email);
  if (!user) redirect("/login");
  const name = user.name || user.email.split("@")[0];
  return (
    <main className="mesh min-h-screen">
      <AppNav name={name} image={user.image} />
      <div className="mx-auto max-w-2xl px-6 py-12">
        <p className="text-sm font-bold uppercase tracking-[.2em] text-moss">Account settings</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Your profile</h1>
        <p className="mt-2 text-slate-600">Manage the identity behind your focus streak.</p>
        <div className="mt-8">
          <ProfileForm initialName={name} initialImage={user.image} email={user.email} />
        </div>
      </div>
    </main>
  );
}
