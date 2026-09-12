import type { EntityStatus } from "./common";

/** Fixed = land and buildings. Mobile = vehicles and movable assets. */
export type AssetKind = "fixed" | "mobile";

/**
 * The exact values ResidentFixedAssetDto.propertyType accepts — sent verbatim,
 * so no mapping layer can drift. The design showed six of these; the API has nine.
 */
export type PropertyType =
  | "Duplex" | "Apartments" | "Shortlet" | "Hotel" | "SuperMarket"
  | "School" | "Hospital" | "Church" | "Office";
export const PROPERTY_TYPES: PropertyType[] = [
  "Duplex", "Apartments", "Shortlet", "Hotel", "SuperMarket",
  "School", "Hospital", "Church", "Office",
];
export const propertyTypeLabel = (t: PropertyType) => (t === "SuperMarket" ? "Supermarket" : t);

export type Availability = "FOR_RENT" | "FOR_SALE" | "OCCUPIED" | "NONE";
export const availabilityLabel = (a: Availability) =>
  ({ FOR_RENT: "For Rent", FOR_SALE: "For Sale", OCCUPIED: "Occupied", NONE: "-- --" }[a]);

export interface PropertyImage {
  id: string;
  url: string;
}

export interface PropertyActivity {
  id: string;
  date: string;
  action: string;
}

export interface Property {
  id: string;
  kind: AssetKind;
  propertyName: string;
  propertyNumber: string;
  propertyType: PropertyType;
  houseNumber: string;
  floorNumber: string;
  noOfRooms: number;
  totalNoOfFloors: number;
  description: string;
  images: PropertyImage[];

  address: string;
  street: string;
  city: string;
  state: string;
  country: string;

  contactFirstName: string;
  contactLastName: string;
  contactEmail: string;
  contactCountryCode: string;
  contactPhone: string;

  forRent: boolean;
  forSale: boolean;
  availability: Availability;
  status: EntityStatus | "REMOVED";

  createdAt: string;
  occupantName?: string;
  occupantUnit?: string;
  occupantPhone?: string;
  occupantResidentId?: string;
  activities: PropertyActivity[];
  /** Set when temporarily removed. */
  removedReason?: string;
}

/** Step 1 — Property Details */
export interface PropertyDetailsStep {
  propertyType: PropertyType | "";
  propertyName: string;
  propertyNumber: string;
  houseNumber: string;
  floorNumber: string;
  noOfRooms: string;
  totalNoOfFloors: string;
  description: string;
  images: PropertyImage[];
}

/** Step 2 — Property Location */
export interface PropertyLocationStep {
  address: string;
  street: string;
  city: string;
  state: string;
  country: string;
}

/** Step 3 — Property Contact & Availability */
/**
 * Step 3 fills ResidentFixedAssetDto.owner (a SignUpDto), which also requires a
 * tenancy window. startDate/endDate are not in the mockup but the API demands them.
 */
export interface PropertyContactStep {
  contactFirstName: string;
  contactLastName: string;
  contactEmail: string;
  contactCountryCode: string;
  contactPhone: string;
  startDate: string;
  endDate: string;
  forRent: boolean;
  forSale: boolean;
}

export type CreatePropertyDto =
  PropertyDetailsStep & PropertyLocationStep & PropertyContactStep & { kind: AssetKind };

export interface AssetStats {
  total: number;
  active: number;
  forRent: number;
  forSale: number;
}
