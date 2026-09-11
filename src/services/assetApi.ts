import { USE_MOCKS } from "./mockFlags";
import { assetsMockApi } from "./mock/assets.mock";
import type { Paged } from "../types/common";
import type { AssetKind, AssetStats, CreatePropertyDto, Property } from "../types/asset";

export interface AssetListParams {
  kind: AssetKind;
  page?: number;
  pageSize?: number;
  search?: string;
  type?: string;
  status?: string;
  availability?: string;
}

/** Contract both implementations satisfy — see securityApi.ts for the rationale. */
export interface AssetApi {
  list(params: AssetListParams): Promise<Paged<Property>>;
  getById(id: string): Promise<Property | undefined>;
  stats(kind: AssetKind): Promise<AssetStats>;
  create(dto: CreatePropertyDto): Promise<Property>;
  update(id: string, patch: Partial<Property>): Promise<Property | undefined>;
  temporarilyRemove(id: string, reason: string): Promise<Property | undefined>;
}

const notImplemented = (what: string) => () => {
  throw new Error(`${what} is not implemented by the backend yet.`);
};

const assetRealApi: AssetApi = {
  list: notImplemented("GET /property"),
  getById: notImplemented("GET /property/{id}"),
  stats: notImplemented("GET /property/stats"),
  create: notImplemented("POST /property"),
  update: notImplemented("PUT /property/{id}"),
  temporarilyRemove: notImplemented("PATCH /property/{id}/remove"),
};

export const assetApi: AssetApi = USE_MOCKS ? assetsMockApi : assetRealApi;
export const ASSETS_IS_MOCK = USE_MOCKS;
