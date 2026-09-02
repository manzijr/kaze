import { Link } from "@/i18n/navigation";
import { Home, Heart } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("nav");
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface/95 px-6 py-3 backdrop-blur">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Home className="h-4.5 w-4.5" strokeWidth={2.5} />
          </span>
          Kaze
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/saved"
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            <Heart className="h-4 w-4" />
            {t("saved")}
          </Link>
          <Link
            href="/login"
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
          >
            {t("listYourProperty")}
          </Link>
          <LanguageSwitcher />
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
