"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Location } from "@kaze/shared";

const pillClass =
  "rounded-full border-0 bg-muted px-4 py-2.5 text-sm font-medium text-foreground outline-none transition hover:bg-border/60 focus:ring-2 focus:ring-primary/40";

export function SearchFilters({
  locations,
  values,
}: {
  locations: Location[];
  values: Record<string, string | undefined>;
}) {
  const t = useTranslations("search");
  const [province, setProvince] = useState(values.province ?? "");
  const [district, setDistrict] = useState(values.district ?? "");
  const [sector, setSector] = useState(values.sector ?? "");
  const [showMore, setShowMore] = useState(Boolean(values.furnished || values.verified_only));

  const provinces = useMemo(() => [...new Set(locations.map((l) => l.province))].sort(), [locations]);

  const districts = useMemo(
    () =>
      [
        ...new Set(
          locations.filter((l) => !province || l.province === province).map((l) => l.district),
        ),
      ].sort(),
    [locations, province],
  );

  const sectors = useMemo(
    () =>
      [
        ...new Set(
          locations
            .filter((l) => (!province || l.province === province) && (!district || l.district === district))
            .map((l) => l.sector),
        ),
      ].sort(),
    [locations, province, district],
  );

  return (
    <form className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-surface p-2.5 shadow-sm">
      <select name="listing_type" defaultValue={values.listing_type ?? ""} className={pillClass}>
        <option value="">{t("anyTransaction")}</option>
        <option value="rent">{t("forRent")}</option>
        <option value="sale">{t("forSale")}</option>
      </select>

      <select name="property_type" defaultValue={values.property_type ?? ""} className={pillClass}>
        <option value="">{t("anyPropertyType")}</option>
        <option value="house">{t("house")}</option>
        <option value="apartment">{t("apartment")}</option>
        <option value="room">{t("room")}</option>
        <option value="land">{t("land")}</option>
        <option value="commercial">{t("commercial")}</option>
        <option value="office">{t("office")}</option>
      </select>

      <span className="h-6 w-px bg-border" aria-hidden />

      <select
        name="province"
        value={province}
        onChange={(e) => {
          setProvince(e.target.value);
          setDistrict("");
          setSector("");
        }}
        className={pillClass}
      >
        <option value="">{t("anyProvince")}</option>
        {provinces.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>

      <select
        name="district"
        value={district}
        onChange={(e) => {
          setDistrict(e.target.value);
          setSector("");
        }}
        className={pillClass}
      >
        <option value="">{t("anyDistrict")}</option>
        {districts.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>

      <select
        name="sector"
        value={sector}
        onChange={(e) => setSector(e.target.value)}
        className={pillClass}
      >
        <option value="">{t("anySector")}</option>
        {sectors.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <span className="h-6 w-px bg-border" aria-hidden />

      <select name="min_bedrooms" defaultValue={values.min_bedrooms ?? ""} className={pillClass}>
        <option value="">{t("anyBedrooms")}</option>
        <option value="1">{t("bedroomsPlus", { count: 1 })}</option>
        <option value="2">{t("bedroomsPlus", { count: 2 })}</option>
        <option value="3">{t("bedroomsPlus", { count: 3 })}</option>
        <option value="4">{t("bedroomsPlus", { count: 4 })}</option>
      </select>

      <input
        type="number"
        name="min_price"
        placeholder={t("minPrice")}
        defaultValue={values.min_price ?? ""}
        className={`w-28 ${pillClass}`}
      />
      <input
        type="number"
        name="max_price"
        placeholder={t("maxPrice")}
        defaultValue={values.max_price ?? ""}
        className={`w-28 ${pillClass}`}
      />

      <button
        type="button"
        onClick={() => setShowMore((v) => !v)}
        className={`flex items-center gap-1.5 ${pillClass}`}
      >
        <SlidersHorizontal className="h-4 w-4" />
        {t("moreFilters")}
      </button>

      <button
        type="submit"
        className="ml-auto flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
      >
        <Search className="h-4 w-4" strokeWidth={2.5} />
        {t("search")}
      </button>

      {showMore && (
        <div className="flex w-full flex-wrap items-center gap-4 border-t border-border pt-3">
          <label className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">{t("furnished")}</span>
            <select name="furnished" defaultValue={values.furnished ?? ""} className={pillClass}>
              <option value="">{t("any")}</option>
              <option value="true">{t("furnishedOption")}</option>
              <option value="false">{t("unfurnishedOption")}</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="verified_only"
              value="true"
              defaultChecked={values.verified_only === "true"}
              className="h-4 w-4 rounded border-border"
            />
            {t("titleVerifiedOnly")}
          </label>
        </div>
      )}
    </form>
  );
}
