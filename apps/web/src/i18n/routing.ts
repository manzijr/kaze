import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "rw"],
  defaultLocale: "en",
  // "as-needed": English keeps today's unprefixed URLs; Kinyarwanda is
  // served under /rw/... . Keeps existing links/bookmarks working while
  // still giving each language a distinct URL for hreflang.
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];
