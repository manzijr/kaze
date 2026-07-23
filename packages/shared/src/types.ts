export type UserRole = "buyer" | "agent" | "owner" | "admin";

export interface AppUser {
  id: string;
  role: UserRole;
  phone: string;
  name: string;
  agencyId: string | null;
}

export interface Agency {
  id: string;
  name: string;
  verified: boolean;
}

export interface Location {
  id: string;
  province: string;
  district: string;
  sector: string;
  cell: string | null;
}

export type ListingType = "sale" | "rent";

export type PropertyType =
  | "house"
  | "apartment"
  | "land"
  | "commercial"
  | "office";

export type ListingStatus = "draft" | "pending_review" | "published" | "archived";

export interface Listing {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  price: number;
  currency: "RWF" | "USD";
  listingType: ListingType;
  propertyType: PropertyType;
  bedrooms: number | null;
  bathrooms: number | null;
  sizeSqm: number | null;
  locationId: string;
  lat: number | null;
  lng: number | null;
  status: ListingStatus;
  featuredUntil: string | null;
  createdAt: string;
}

export interface ListingPhoto {
  id: string;
  listingId: string;
  url: string;
  sortOrder: number;
}

export interface Inquiry {
  id: string;
  listingId: string;
  buyerId: string | null;
  name: string;
  phone: string;
  message: string;
  createdAt: string;
}
