export type UserRole = "buyer" | "agent" | "owner" | "admin";

export type VerificationStatus = "none" | "pending" | "verified" | "rejected";

export interface AppUser {
  id: string;
  role: UserRole;
  phone: string;
  name: string;
  agencyId: string | null;
  verificationStatus: VerificationStatus;
}

export interface PublicProfile {
  id: string;
  name: string;
  role: UserRole;
  agencyId: string | null;
  verificationStatus: VerificationStatus;
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
  | "office"
  | "room";

export type ListingStatus = "draft" | "pending_review" | "published" | "archived";

export type RoadAccess = "paved" | "murram" | "footpath";

export type YearBuiltRange = "under_5" | "5_to_15" | "over_15";

export type FinishQuality = "basic" | "standard" | "high_end";

export type ClosedStatus = "sold" | "rented" | "withdrawn";

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
  furnished: boolean | null;
  hasParking: boolean;
  hasWaterTank: boolean;
  hasBackupPower: boolean;
  hasBoysQuarters: boolean;
  isFenced: boolean;
  hasGarden: boolean;
  hasFiberInternet: boolean;
  roadAccess: RoadAccess | null;
  advanceMonthsRequired: number | null;
  viewCount: number;
  whatsappClickCount: number;
  expiresAt: string | null;
  titleVerificationStatus: VerificationStatus;
  plotSizeSqm: number | null;
  floors: number | null;
  yearBuiltRange: YearBuiltRange | null;
  finishQuality: FinishQuality | null;
  closedStatus: ClosedStatus | null;
  achievedPrice: number | null;
  closedAt: string | null;
}

export interface ListingPhoto {
  id: string;
  listingId: string;
  url: string;
  sortOrder: number;
}

export interface ListingVerification {
  id: string;
  listingId: string;
  upiNumber: string | null;
  titleDocumentUrl: string | null;
  status: VerificationStatus;
  reviewedBy: string | null;
  reviewedAt: string | null;
  notes: string | null;
  createdAt: string;
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

export interface Favorite {
  userId: string;
  listingId: string;
  createdAt: string;
}

export type ListingReportStatus = "open" | "reviewed" | "dismissed";

export interface ListingReport {
  id: string;
  listingId: string;
  reporterId: string | null;
  reason: string;
  message: string | null;
  status: ListingReportStatus;
  createdAt: string;
}
