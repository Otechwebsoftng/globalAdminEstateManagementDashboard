import { USE_MOCKS } from "./mockFlags";
import { securityMockApi } from "./mock/security.mock";
import type { ListParams, Paged } from "../types/common";
import type {
  SecurityPersonnel, CreateSecurityPersonnelDto, SecurityStats,
} from "../types/security";

/**
 * The contract both implementations satisfy. Keeping it explicit means
 * TypeScript fails the build if a future real implementation drifts from the
 * shape the UI already consumes.
 */
export interface SecurityApi {
  list(params?: ListParams): Promise<Paged<SecurityPersonnel>>;
  getById(id: string): Promise<SecurityPersonnel | undefined>;
  stats(): Promise<SecurityStats>;
  create(dto: CreateSecurityPersonnelDto): Promise<SecurityPersonnel>;
  setStatus(id: string, status: SecurityPersonnel["status"]): Promise<SecurityPersonnel | undefined>;
}

// No /security endpoints exist yet. When they land, implement them here and
// drop the ternary below — no component changes required.
const securityRealApi: SecurityApi = {
  list: () => { throw new Error("GET /security is not implemented by the backend yet."); },
  getById: () => { throw new Error("GET /security/{id} is not implemented by the backend yet."); },
  stats: () => { throw new Error("GET /security/stats is not implemented by the backend yet."); },
  create: () => { throw new Error("POST /security is not implemented by the backend yet."); },
  setStatus: () => { throw new Error("PATCH /security/{id} is not implemented by the backend yet."); },
};

export const securityApi: SecurityApi = USE_MOCKS ? securityMockApi : securityRealApi;

/** Drives the "Demo data" badge; flips automatically when the resolver does. */
export const SECURITY_IS_MOCK = USE_MOCKS;
export const resetSecurityMocks = () => securityMockApi.reset();
