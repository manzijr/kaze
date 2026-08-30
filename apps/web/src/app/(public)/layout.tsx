import Link from "next/link";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <Link href="/" className="font-semibold">
          Kaze
        </Link>
        <Link href="/login" className="text-sm text-zinc-600 hover:underline dark:text-zinc-400">
          List your property
        </Link>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
