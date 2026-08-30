import type { Location } from "@kaze/shared";

const selectClass =
  "rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900";

export function SearchFilters({
  locations,
  values,
}: {
  locations: Location[];
  values: Record<string, string | undefined>;
}) {
  const provinces = [...new Set(locations.map((l) => l.province))].sort();
  const districts = [...new Set(locations.map((l) => l.district))].sort();
  const sectors = [...new Set(locations.map((l) => l.sector))].sort();

  return (
    <form className="flex flex-wrap gap-3 border-b border-zinc-200 pb-6 dark:border-zinc-800">
      <select name="listing_type" defaultValue={values.listing_type ?? ""} className={selectClass}>
        <option value="">For sale or rent</option>
        <option value="rent">For rent</option>
        <option value="sale">For sale</option>
      </select>

      <select name="property_type" defaultValue={values.property_type ?? ""} className={selectClass}>
        <option value="">Any property type</option>
        <option value="house">House</option>
        <option value="apartment">Apartment</option>
        <option value="land">Land</option>
        <option value="commercial">Commercial</option>
        <option value="office">Office</option>
      </select>

      <select name="province" defaultValue={values.province ?? ""} className={selectClass}>
        <option value="">Any province</option>
        {provinces.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>

      <select name="district" defaultValue={values.district ?? ""} className={selectClass}>
        <option value="">Any district</option>
        {districts.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>

      <select name="sector" defaultValue={values.sector ?? ""} className={selectClass}>
        <option value="">Any sector</option>
        {sectors.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <select name="min_bedrooms" defaultValue={values.min_bedrooms ?? ""} className={selectClass}>
        <option value="">Any bedrooms</option>
        <option value="1">1+ bd</option>
        <option value="2">2+ bd</option>
        <option value="3">3+ bd</option>
        <option value="4">4+ bd</option>
      </select>

      <input
        type="number"
        name="min_price"
        placeholder="Min price"
        defaultValue={values.min_price ?? ""}
        className={`w-32 ${selectClass}`}
      />
      <input
        type="number"
        name="max_price"
        placeholder="Max price"
        defaultValue={values.max_price ?? ""}
        className={`w-32 ${selectClass}`}
      />

      <button
        type="submit"
        className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
      >
        Search
      </button>
    </form>
  );
}
