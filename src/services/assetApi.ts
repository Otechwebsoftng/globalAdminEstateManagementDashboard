import { USE_MOCKS } from "./mockFlags";
import { assetsMockApi } from "./mock/assets.mock";
import { residentAssetApi, type ResidentFixedAssetDto } from "./api";
import { parseList } from "../lib/parseList";
import type { Paged } from "../types/common";
import type {
  AssetKind, AssetStats, Availability, CreatePropertyDto, Property, PropertyType,
} from "../types/asset";

export interface AssetListParams {
  kind: AssetKind;
  estateId: string;
  page?: number;
  pageSize?: number;
  search?: string;
  type?: string;
  status?: string;
  availability?: string;
}

export interface AssetApi {
  list(params: AssetListParams): Promise<Paged<Property>>;
  getById(id: string, estateId: string): Promise<Property | undefined>;
  stats(kind: AssetKind, estateId: string): Promise<AssetStats>;
  create(dto: CreatePropertyDto, estateId: string): Promise<Property>;
  update(id: string, estateId: string, patch: Partial<Property>): Promise<unknown>;
  temporarilyRemove(id: string, estateId: string, reason: string): Promise<unknown>;
}

const availabilityOf = (r: any): Availability => {
  const s = String(r?.propertyStatus ?? "").toLowerCase();
  if (s === "occupied") return "OCCUPIED";
  if (r?.isForRent) return "FOR_RENT";
  if (r?.isForSale) return "FOR_SALE";
  return "NONE";
};

/** Maps a backend resident-asset record onto the shape the screens consume. */
function toProperty(r: any, kind: AssetKind): Property {
  const owner = r?.owner ?? r?.occupant ?? null;
  return {
    id: r?.id ?? r?._id ?? "",
    kind,
    propertyName: r?.propertyName ?? "--",
    propertyNumber: r?.propertyNumber ?? "",
    propertyType: (r?.propertyType ?? "Duplex") as PropertyType,
    houseNumber: String(r?.houseNumber ?? ""),
    floorNumber: String(r?.floorNumber ?? ""),
    noOfRooms: Number(r?.numberOfRooms ?? 0),
    totalNoOfFloors: Number(r?.numberOfFloors ?? 0),
    description: r?.description ?? "",
    images: (r?.images ?? []).map((u: any, i: number) => ({
      id: u?.id ?? `img-${i}`,
      url: typeof u === "string" ? u : u?.url ?? "",
    })),
    address: r?.address ?? "",
    street: r?.street ?? "",
    city: r?.city ?? "",
    state: r?.state ?? "",
    country: r?.country ?? "",
    contactFirstName: owner?.firstName ?? "",
    contactLastName: owner?.lastName ?? "",
    contactEmail: owner?.email ?? "",
    contactCountryCode: owner?.countryCode ?? "+234",
    contactPhone: owner?.phoneNumber ?? "",
    forRent: !!r?.isForRent,
    forSale: !!r?.isForSale,
    availability: availabilityOf(r),
    status: String(r?.status ?? "").toLowerCase() === "deleted" || r?.isDeleted ? "REMOVED" : "ACTIVE",
    createdAt: r?.createdAt
      ? new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
      : "--",
    occupantName: owner ? [owner.firstName, owner.lastName].filter(Boolean).join(" ") : undefined,
    occupantPhone: owner?.phoneNumber,
    activities: (r?.activities ?? []).map((a: any, i: number) => ({
      id: a?.id ?? `a-${i}`,
      date: a?.createdAt ?? a?.date ?? "--",
      action: a?.action ?? "--",
    })),
    removedReason: r?.reason,
  };
}

const assetRealApi: AssetApi = {
  async list({ kind, estateId, page, pageSize, search, type, status }) {
    const res = await residentAssetApi.list(estateId, {
      page, pageSize, search, status, propertyType: type,
    });
    const rows = parseList(res, "assets", "properties", "result", "data").map((r) => toProperty(r, kind));
    const meta = (res as any)?.meta ?? (res as any)?.data?.meta ?? {};
    return {
      items: rows,
      total: meta.total ?? meta.totalItems ?? rows.length,
      page: meta.page ?? page ?? 1,
      pageSize: meta.pageSize ?? pageSize ?? rows.length,
    };
  },

  async getById(id, estateId) {
    const res = await residentAssetApi.getById(id, estateId);
    const row = (res as any)?.data ?? res;
    return row ? toProperty(row, "fixed") : undefined;
  },

  async stats(kind, estateId) {
    const res = await residentAssetApi.list(estateId, { pageSize: 500 });
    const rows = parseList(res, "assets", "properties", "result", "data").map((r) => toProperty(r, kind));
    return {
      total: rows.length,
      active: rows.filter((r) => r.status === "ACTIVE").length,
      forRent: rows.filter((r) => r.availability === "FOR_RENT").length,
      forSale: rows.filter((r) => r.availability === "FOR_SALE").length,
    };
  },

  async create(dto, estateId) {
    const body: ResidentFixedAssetDto = {
      propertyType: (dto.propertyType || "Duplex") as ResidentFixedAssetDto["propertyType"],
      propertyName: dto.propertyName.trim(),
      propertyNumber: dto.propertyNumber.trim(),
      houseNumber: dto.houseNumber.trim(),
      numberOfRooms: Number(dto.noOfRooms) || 0,
      floorNumber: Number(dto.floorNumber) || 0,
      numberOfFloors: Number(dto.totalNoOfFloors) || 0,
      description: dto.description.trim(),
      address: dto.address.trim(),
      street: dto.street.trim(),
      city: dto.city.trim(),
      state: dto.state.trim(),
      country: dto.country.trim(),
      isForRent: dto.forRent,
      isForSale: dto.forSale,
      owner: {
        firstName: dto.contactFirstName.trim(),
        lastName: dto.contactLastName.trim(),
        countryCode: dto.contactCountryCode.trim(),
        phoneNumber: dto.contactPhone.trim(),
        email: dto.contactEmail.trim(),
        // The DTO requires owner.propertyId, but the property does not exist
        // until this call returns. Sending the human-facing property number is
        // a best guess — confirm with the backend team.
        propertyId: dto.propertyNumber.trim(),
        startDate: dto.startDate,
        endDate: dto.endDate,
      },
    };
    const res = await residentAssetApi.create(estateId, body);
    return toProperty((res as any)?.data ?? res, dto.kind);
  },

  update(id, estateId, patch) {
    return residentAssetApi.update(id, estateId, {
      propertyName: patch.propertyName,
      description: patch.description,
      isForRent: patch.forRent,
      isForSale: patch.forSale,
    });
  },

  temporarilyRemove(id, estateId, reason) {
    return residentAssetApi.softDelete(id, estateId, reason);
  },
};

export const assetApi: AssetApi = USE_MOCKS ? (assetsMockApi as unknown as AssetApi) : assetRealApi;
export const ASSETS_IS_MOCK = USE_MOCKS;
