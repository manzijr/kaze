import type { Listing, Location } from "@kaze/shared";
import { LocationPicker } from "./LocationPicker";
import { MapPicker } from "./MapPicker";

const inputClass =
  "mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-primary/40";

const amenities: { name: string; label: string; defaultKey: keyof Listing }[] = [
  { name: "has_parking", label: "Parking", defaultKey: "hasParking" },
  { name: "has_water_tank", label: "Water tank", defaultKey: "hasWaterTank" },
  { name: "has_backup_power", label: "Backup power (generator/solar)", defaultKey: "hasBackupPower" },
  { name: "has_boys_quarters", label: "Boys' quarters / annex", defaultKey: "hasBoysQuarters" },
  { name: "is_fenced", label: "Fenced compound", defaultKey: "isFenced" },
  { name: "has_garden", label: "Garden", defaultKey: "hasGarden" },
  { name: "has_fiber_internet", label: "Fiber internet available", defaultKey: "hasFiberInternet" },
];

export function ListingFields({
  locations,
  defaults,
}: {
  locations: Location[];
  defaults?: Partial<Listing>;
}) {
  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium">
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={defaults?.title}
          placeholder="3-bedroom house in Kimihurura"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={defaults?.description}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <label htmlFor="listing_type" className="block text-sm font-medium">
            Listing type
          </label>
          <select
            id="listing_type"
            name="listing_type"
            required
            defaultValue={defaults?.listingType ?? "rent"}
            className={inputClass}
          >
            <option value="rent">For rent</option>
            <option value="sale">For sale</option>
          </select>
        </div>
        <div>
          <label htmlFor="property_type" className="block text-sm font-medium">
            Property type
          </label>
          <select
            id="property_type"
            name="property_type"
            required
            defaultValue={defaults?.propertyType ?? "house"}
            className={inputClass}
          >
            <option value="house">House</option>
            <option value="apartment">Apartment</option>
            <option value="room">Room</option>
            <option value="land">Land</option>
            <option value="commercial">Commercial</option>
            <option value="office">Office</option>
          </select>
        </div>
        <div>
          <label htmlFor="price" className="block text-sm font-medium">
            Price
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            required
            defaultValue={defaults?.price}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="currency" className="block text-sm font-medium">
            Currency
          </label>
          <select
            id="currency"
            name="currency"
            required
            defaultValue={defaults?.currency ?? "RWF"}
            className={inputClass}
          >
            <option value="RWF">RWF</option>
            <option value="USD">USD</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="advance_months_required" className="block text-sm font-medium">
          Advance months required (for rentals)
        </label>
        <input
          id="advance_months_required"
          name="advance_months_required"
          type="number"
          min="0"
          placeholder="e.g. 3"
          defaultValue={defaults?.advanceMonthsRequired ?? undefined}
          className={`${inputClass} max-w-[10rem]`}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <label htmlFor="bedrooms" className="block text-sm font-medium">
            Bedrooms
          </label>
          <input
            id="bedrooms"
            name="bedrooms"
            type="number"
            min="0"
            defaultValue={defaults?.bedrooms ?? undefined}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="bathrooms" className="block text-sm font-medium">
            Bathrooms
          </label>
          <input
            id="bathrooms"
            name="bathrooms"
            type="number"
            min="0"
            defaultValue={defaults?.bathrooms ?? undefined}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="floors" className="block text-sm font-medium">
            Floors
          </label>
          <input
            id="floors"
            name="floors"
            type="number"
            min="0"
            defaultValue={defaults?.floors ?? undefined}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="size_sqm" className="block text-sm font-medium">
            Built area (sqm)
          </label>
          <input
            id="size_sqm"
            name="size_sqm"
            type="number"
            min="0"
            step="0.01"
            defaultValue={defaults?.sizeSqm ?? undefined}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <label htmlFor="plot_size_sqm" className="block text-sm font-medium">
            Plot size (sqm)
          </label>
          <input
            id="plot_size_sqm"
            name="plot_size_sqm"
            type="number"
            min="0"
            step="0.01"
            defaultValue={defaults?.plotSizeSqm ?? undefined}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="furnished" className="block text-sm font-medium">
            Furnished
          </label>
          <select
            id="furnished"
            name="furnished"
            defaultValue={defaults?.furnished == null ? "" : String(defaults.furnished)}
            className={inputClass}
          >
            <option value="">Not specified</option>
            <option value="true">Furnished</option>
            <option value="false">Unfurnished</option>
          </select>
        </div>
        <div>
          <label htmlFor="year_built_range" className="block text-sm font-medium">
            Age
          </label>
          <select
            id="year_built_range"
            name="year_built_range"
            defaultValue={defaults?.yearBuiltRange ?? ""}
            className={inputClass}
          >
            <option value="">Not specified</option>
            <option value="under_5">Under 5 years</option>
            <option value="5_to_15">5–15 years</option>
            <option value="over_15">Over 15 years</option>
          </select>
        </div>
        <div>
          <label htmlFor="finish_quality" className="block text-sm font-medium">
            Finish quality
          </label>
          <select
            id="finish_quality"
            name="finish_quality"
            defaultValue={defaults?.finishQuality ?? ""}
            className={inputClass}
          >
            <option value="">Not specified</option>
            <option value="basic">Basic</option>
            <option value="standard">Standard</option>
            <option value="high_end">High-end</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="road_access" className="block text-sm font-medium">
          Road access
        </label>
        <select
          id="road_access"
          name="road_access"
          defaultValue={defaults?.roadAccess ?? ""}
          className={`${inputClass} max-w-xs`}
        >
          <option value="">Not specified</option>
          <option value="paved">Paved</option>
          <option value="murram">Murram (dirt)</option>
          <option value="footpath">Footpath only</option>
        </select>
      </div>

      <div>
        <span className="block text-sm font-medium">Amenities</span>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {amenities.map((a) => (
            <label key={a.name} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name={a.name}
                defaultChecked={Boolean(defaults?.[a.defaultKey])}
                className="h-4 w-4 rounded border-border"
              />
              {a.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <span className="block text-sm font-medium">Location</span>
        <div className="mt-1">
          <LocationPicker locations={locations} defaultLocationId={defaults?.locationId} />
        </div>
      </div>

      <div>
        <span className="block text-sm font-medium">Map location</span>
        <div className="mt-1">
          <MapPicker defaultLat={defaults?.lat} defaultLng={defaults?.lng} />
        </div>
      </div>
    </div>
  );
}
