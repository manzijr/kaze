"use client";

import { useMemo, useState } from "react";
import type { Location } from "@kaze/shared";

const selectClass =
  "mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900";

export function LocationPicker({
  locations,
  defaultLocationId,
}: {
  locations: Location[];
  defaultLocationId?: string;
}) {
  const defaultLocation = locations.find((l) => l.id === defaultLocationId);

  const [province, setProvince] = useState(defaultLocation?.province ?? "");
  const [district, setDistrict] = useState(defaultLocation?.district ?? "");
  const [sector, setSector] = useState(defaultLocation?.sector ?? "");

  const provinces = useMemo(
    () => [...new Set(locations.map((l) => l.province))].sort(),
    [locations],
  );

  const districts = useMemo(
    () =>
      [
        ...new Set(
          locations.filter((l) => l.province === province).map((l) => l.district),
        ),
      ].sort(),
    [locations, province],
  );

  const sectors = useMemo(
    () =>
      [
        ...new Set(
          locations
            .filter((l) => l.province === province && l.district === district)
            .map((l) => l.sector),
        ),
      ].sort(),
    [locations, province, district],
  );

  const selected = locations.find(
    (l) => l.province === province && l.district === district && l.sector === sector,
  );

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div>
        <label className="block text-sm font-medium">Province</label>
        <select
          value={province}
          onChange={(e) => {
            setProvince(e.target.value);
            setDistrict("");
            setSector("");
          }}
          required
          className={selectClass}
        >
          <option value="" disabled>
            Select province
          </option>
          {provinces.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium">District</label>
        <select
          value={district}
          onChange={(e) => {
            setDistrict(e.target.value);
            setSector("");
          }}
          required
          disabled={!province}
          className={selectClass}
        >
          <option value="" disabled>
            Select district
          </option>
          {districts.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium">Sector</label>
        <select
          value={sector}
          onChange={(e) => setSector(e.target.value)}
          required
          disabled={!district}
          className={selectClass}
        >
          <option value="" disabled>
            Select sector
          </option>
          {sectors.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <input type="hidden" name="location_id" value={selected?.id ?? ""} />
    </div>
  );
}
