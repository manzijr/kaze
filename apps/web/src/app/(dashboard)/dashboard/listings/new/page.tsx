import { createClient } from "@/lib/supabase/server";
import { NewListingActions } from "./NewListingActions";

export default async function NewListingPage() {
  const supabase = await createClient();
  const { data: locations } = await supabase
    .from("locations")
    .select("id, province, district, sector, cell")
    .order("province")
    .order("district")
    .order("sector");

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold">New listing</h1>
      <NewListingActions locations={locations ?? []} />
    </div>
  );
}
