import { createSupabaseClient, type Listing } from "@kaze/shared";

const placeholder: Listing["listingType"] = "sale";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-col items-center gap-4 py-32 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Kaze
        </h1>
        <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
          Find a home in Rwanda. {placeholder === "sale" ? "Buy" : "Rent"} listings coming soon.
        </p>
        <p className="text-xs text-zinc-400">
          @kaze/shared loaded: {typeof createSupabaseClient === "function" ? "yes" : "no"}
        </p>
      </main>
    </div>
  );
}
