import type { Listing, Location } from "@kaze/shared";
import { LocationPicker } from "./LocationPicker";

const inputClass =
  "mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900";

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

      <div className="grid grid-cols-3 gap-4">
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
          <label htmlFor="size_sqm" className="block text-sm font-medium">
            Size (sqm)
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

      <div>
        <span className="block text-sm font-medium">Location</span>
        <div className="mt-1">
          <LocationPicker locations={locations} defaultLocationId={defaults?.locationId} />
        </div>
      </div>
    </div>
  );
}
