// MOCK — no property/asset endpoints exist in backend.json. See assetApi.ts.
import { createMockStore, paginate, simulateLatency } from "./store";
import type {
  Property, AssetKind, CreatePropertyDto, PropertyType, Availability,
} from "../../types/asset";
import type { ListParams, Paged } from "../../types/common";

const TYPES: PropertyType[] = ["Duplex", "Duplex", "Apartments", "School", "Duplex", "Apartments", "Apartments", "Office", "School", "Duplex", "Shortlet", "Hospital"];
const AVAIL: Availability[] = ["FOR_RENT", "FOR_RENT", "FOR_SALE", "FOR_SALE", "FOR_SALE", "FOR_RENT", "FOR_SALE", "OCCUPIED", "NONE", "FOR_RENT", "FOR_RENT", "FOR_SALE"];
const STREETS = ["Franklyn Str", "Road 2", "Jacob Str", "Franklyn", "Franklyn", "Franklyn", "Franklyn", "Franklyn", "Franklyn", "Franklyn", "Marina Rd", "Awolowo Rd"];

const make = (kind: AssetKind, i: number): Property => ({
  id: `${kind}-${i + 1}`,
  kind,
  propertyName: "Abayomi Williams",
  propertyNumber: `P-${100 + i}`,
  propertyType: TYPES[i % TYPES.length],
  houseNumber: "4",
  floorNumber: i % 3 === 0 ? "1" : "4",
  noOfRooms: 4,
  totalNoOfFloors: 1,
  description:
    "Worem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu turpis molestie, dictum est a, mattis tellus. Sed dignissim, metus nec fringilla accumsan, risus sem sollicitudin lacus, ut interdum tellus elit sed risus.",
  images: [],
  address: STREETS[i % STREETS.length],
  street: STREETS[i % STREETS.length],
  city: "Lagos",
  state: "Lagos State",
  country: "Nigeria",
  contactFirstName: "Abayomi",
  contactLastName: "Williams",
  contactEmail: "youremail@gmail.com",
  contactCountryCode: "+234",
  contactPhone: "8035876754",
  forRent: AVAIL[i % AVAIL.length] === "FOR_RENT",
  forSale: AVAIL[i % AVAIL.length] === "FOR_SALE",
  availability: AVAIL[i % AVAIL.length],
  status: i === 8 ? "REMOVED" : "ACTIVE",
  createdAt: "Mar 14, 2026",
  occupantName: AVAIL[i % AVAIL.length] === "OCCUPIED" ? "Chikwendu Emmanuel" : undefined,
  occupantUnit: AVAIL[i % AVAIL.length] === "OCCUPIED" ? "A12" : undefined,
  occupantPhone: AVAIL[i % AVAIL.length] === "OCCUPIED" ? "(+234)803- 587- 6754" : undefined,
  activities: [
    { id: "a1", date: "Mar 14, 2026", action: "Property created" },
    { id: "a2", date: "Mar 14, 2026", action: "Property Information updated" },
  ],
});

const SEED: Property[] = [
  ...Array.from({ length: 12 }, (_, i) => make("fixed", i)),
  ...Array.from({ length: 7 }, (_, i) => make("mobile", i)),
];

const store = createMockStore<Property>("assets", SEED);

const matches = (p: Property, params: ListParams & { kind?: AssetKind; type?: string; availability?: string }) => {
  if (params.kind && p.kind !== params.kind) return false;
  const q = params.search?.trim().toLowerCase();
  if (q) {
    const hay = [p.propertyName, p.propertyType, p.address, p.city].join(" ").toLowerCase();
    if (!hay.includes(q)) return false;
  }
  if (params.type && params.type !== "All" && p.propertyType !== params.type) return false;
  if (params.status && params.status !== "All" && p.status !== params.status) return false;
  if (params.availability && params.availability !== "All" && p.availability !== params.availability) return false;
  return true;
};

export const assetsMockApi = {
  async list(params: any = {}): Promise<Paged<Property>> {
    await simulateLatency();
    const filtered = store.all().filter((p) => matches(p, params));
    return paginate(filtered, params.page ?? 1, params.pageSize ?? 10);
  },

  async getById(id: string, _estateId?: string) {
    await simulateLatency();
    return store.find(id);
  },

  async stats(kind: AssetKind, _estateId?: string) {
    await simulateLatency();
    const all = store.all().filter((p) => p.kind === kind);
    return {
      total: all.length,
      active: all.filter((p) => p.status === "ACTIVE").length,
      forRent: all.filter((p) => p.availability === "FOR_RENT").length,
      forSale: all.filter((p) => p.availability === "FOR_SALE").length,
    };
  },

  async create(dto: CreatePropertyDto, _estateId?: string): Promise<Property> {
    await simulateLatency();
    const availability: Availability = dto.forRent ? "FOR_RENT" : dto.forSale ? "FOR_SALE" : "NONE";
    const created: Property = {
      id: `${dto.kind}-${Date.now()}`,
      kind: dto.kind,
      propertyName: dto.propertyName,
      propertyNumber: dto.propertyNumber,
      propertyType: (dto.propertyType || "Duplex") as PropertyType,
      houseNumber: dto.houseNumber,
      floorNumber: dto.floorNumber,
      noOfRooms: Number(dto.noOfRooms) || 0,
      totalNoOfFloors: Number(dto.totalNoOfFloors) || 0,
      description: dto.description,
      images: dto.images,
      address: dto.address, street: dto.street, city: dto.city, state: dto.state, country: dto.country,
      contactFirstName: dto.contactFirstName, contactLastName: dto.contactLastName,
      contactEmail: dto.contactEmail, contactCountryCode: dto.contactCountryCode,
      contactPhone: dto.contactPhone,
      forRent: dto.forRent, forSale: dto.forSale, availability,
      status: "ACTIVE",
      createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      activities: [{ id: "a1", date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }), action: "Property created" }],
    };
    return store.insert(created);
  },

  async update(id: string, _estateId: string, patch: Partial<Property>) {
    await simulateLatency();
    return store.update(id, patch);
  },

  async temporarilyRemove(id: string, _estateId: string, reason: string) {
    await simulateLatency();
    return store.update(id, { status: "REMOVED", availability: "NONE", removedReason: reason });
  },

  reset: () => store.reset(),
};
