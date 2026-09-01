export type RecentlyViewedItem = {
  id: string;
  title: string;
  price: number;
  currency: string;
  photoUrl: string | null;
};

const STORAGE_KEY = "kaze_recently_viewed";
const MAX_ITEMS = 12;

export function recordRecentlyViewed(item: RecentlyViewedItem) {
  if (typeof window === "undefined") return;
  try {
    const existing = readRecentlyViewed().filter((i) => i.id !== item.id);
    const next = [item, ...existing].slice(0, MAX_ITEMS);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // localStorage can throw in private browsing / disabled-storage
    // contexts -- recently-viewed is a nice-to-have, never worth breaking
    // the page over.
  }
}

export function readRecentlyViewed(): RecentlyViewedItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as RecentlyViewedItem[]) : [];
  } catch {
    return [];
  }
}
