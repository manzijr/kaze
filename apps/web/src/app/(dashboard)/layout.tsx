import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("name, role")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/onboarding");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/dashboard" className="font-semibold">
            Kaze
          </Link>
          <Link href="/dashboard/listings" className="text-zinc-600 dark:text-zinc-400">
            Listings
          </Link>
          <Link href="/dashboard/inquiries" className="text-zinc-600 dark:text-zinc-400">
            Inquiries
          </Link>
          {profile.role === "admin" && (
            <Link href="/dashboard/moderation" className="text-zinc-600 dark:text-zinc-400">
              Moderation
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-zinc-500">{profile.name}</span>
          <form action={signOut}>
            <button type="submit" className="text-zinc-600 hover:underline dark:text-zinc-400">
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
