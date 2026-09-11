import type { EntityStatus } from "./common";

/** Fixed = land and buildings. Mobile = vehicles and movable assets. */
export type AssetKind = "fixed" | "mobile";

export type PropertyType =
  | "DUPLEX" | "APARTMENTS" | "SHORTLET" | "SUPERMARKET" | "SCHOOL" | "OFFICE";
export const PROPERTY_TYPES: PropertyType[] = [
  "DUPLEX", "APARTMENTS", "SHORTLET", "SUPERMARKET", "SCHOOL", "OFFICE",
];
export const propertyTypeLabel = (t: PropertyType) =>
  ({
    DUPLEX: "Duplex", APARTMENTS: "Apartments", SHORTLET: "Shortlet",
    SUPERMARKET: "Supermarket", SCHOOL: "School", OFFICE: "Office",
  }[t]);

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
  propertyType: PropertyType;
  houseNumber: string;
  floorNumber: string;
  noOfRooms: number;
  totalNoOfFloors: number;
  description: string;
  images: PropertyImage[];

  address: string;
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
  occupantResidentId?: string;
  activities: PropertyActivity[];
  /** Set when temporarily removed. */
  removedReason?: string;
}

/** Step 1 — Property Details */
export interface PropertyDetailsStep {
  propertyType: PropertyType | "";
  propertyName: string;
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
  city: string;
  state: string;
  country: string;
}

/** Step 3 — Property Contact & Availability */
export interface PropertyContactStep {
  contactFirstName: string;
  contactLastName: string;
  contactEmail: string;
  contactCountryCode: string;
  contactPhone: string;
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
