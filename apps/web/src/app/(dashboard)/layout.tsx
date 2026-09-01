import Link from "next/link";
import { redirect } from "next/navigation";
import { Home } from "lucide-react";
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
    .select("name, role, verification_status")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/onboarding");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border bg-surface px-6 py-3">
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Home className="h-4 w-4" strokeWidth={2.5} />
            </span>
            Kaze
          </Link>
          <Link href="/dashboard/listings" className="text-muted-foreground transition hover:text-foreground">
            Listings
          </Link>
          <Link href="/dashboard/inquiries" className="text-muted-foreground transition hover:text-foreground">
            Inquiries
          </Link>
          <Link href="/dashboard/verification" className="text-muted-foreground transition hover:text-foreground">
            Verification
          </Link>
          {profile.role === "admin" && (
            <>
              <Link
                href="/dashboard/moderation"
                className="text-muted-foreground transition hover:text-foreground"
              >
                Moderation
              </Link>
              <Link
                href="/dashboard/agent-verifications"
                className="text-muted-foreground transition hover:text-foreground"
              >
                Agent Verifications
              </Link>
              <Link
                href="/dashboard/title-verifications"
                className="text-muted-foreground transition hover:text-foreground"
              >
                Title Verifications
              </Link>
            </>
          )}
        </nav>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">{profile.name}</span>
          <form action={signOut}>
            <button
              type="submit"
              className="text-muted-foreground transition hover:text-foreground hover:underline"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
