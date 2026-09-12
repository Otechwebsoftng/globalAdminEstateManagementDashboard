import { USE_MOCKS } from "./mockFlags";
import { securityMockApi } from "./mock/security.mock";
import { securityPersonnelApi, type OnboardPersonnelDto } from "./api";
import { parseList } from "../lib/parseList";
import type { ListParams, Paged } from "../types/common";
import type {
  SecurityPersonnel, CreateSecurityPersonnelDto, SecurityStats,
  DocumentType, Gender, Shift, Gate,
} from "../types/security";

export interface SecurityApi {
  list(params: ListParams & { estateId: string }): Promise<Paged<SecurityPersonnel>>;
  getById(id: string, estateId: string): Promise<SecurityPersonnel | undefined>;
  stats(estateId: string): Promise<SecurityStats>;
  create(dto: CreateSecurityPersonnelDto, estateId: string): Promise<SecurityPersonnel>;
  setStatus(id: string, status: SecurityPersonnel["status"], estateId: string): Promise<unknown>;
}

/** Maps a backend personnel record onto the shape the screens consume. */
function toPersonnel(r: any): SecurityPersonnel {
  const status = String(r?.status ?? r?.userStatus ?? "active").toLowerCase();
  return {
    id: r?.id ?? r?._id ?? "",
    reference: r?.reference ?? r?.staffId ?? (r?.id ? `SVE-${String(r.id).slice(-4)}` : "--"),
    firstName: r?.firstName ?? "",
    lastName: r?.lastName ?? "",
    email: r?.email ?? "",
    countryCode: r?.countryCode ?? "+234",
    phoneNumber: r?.phoneNumber ?? "",
    documentType: (r?.documentType ?? "NIN") as DocumentType,
    documentNumber: r?.documentNumber ?? "",
    gender: (r?.gender ?? "male") as Gender,
    // The API has no gate or shift field yet; show a dash rather than invent one.
    assignedGate: (r?.assignedGate ?? "") as Gate,
    shift: (r?.shift ?? "") as Shift,
    status:
      status === "suspended" || status === "inactive" ? "SUSPENDED"
      : status === "pending" ? "PENDING"
      : "ACTIVE",
    estateId: r?.estateId ?? r?.estate?.id ?? "",
    estateName: r?.estate?.estateName ?? r?.estateName ?? "",
    dateAdded: r?.createdAt ? new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "--",
    lastActivity: r?.lastActivity ?? "--",
    lastActiveAt: r?.lastSeenAt ?? "--",
    totalVerifications: r?.totalVerifications ?? 0,
    todaysVerifications: r?.todaysVerifications ?? 0,
    attendanceRate: r?.attendanceRate ?? 0,
    verificationLogs: (r?.verificationLogs ?? []).map((l: any, i: number) => ({
      id: l?.id ?? `vl-${i}`,
      visitorName: [l?.firstName, l?.lastName].filter(Boolean).join(" ") || l?.visitorName || "--",
      code: l?.code ?? "--",
      time: l?.entryTime ?? l?.createdAt ?? "--",
      gate: (l?.gate ?? "") as Gate,
      result: l?.verified === false ? "DENIED" : "VERIFIED",
    })),
  };
}

const securityRealApi: SecurityApi = {
  async list({ estateId, page, pageSize, search, status }) {
    const res = await securityPersonnelApi.list(estateId, { page, pageSize, search, status });
    const rows = parseList(res, "personnel", "users", "result", "data").map(toPersonnel);
    const meta = (res as any)?.meta ?? (res as any)?.data?.meta ?? {};
    return {
      items: rows,
      total: meta.total ?? meta.totalItems ?? rows.length,
      page: meta.page ?? page ?? 1,
      pageSize: meta.pageSize ?? pageSize ?? rows.length,
    };
  },

  async getById(id, estateId) {
    const res = await securityPersonnelApi.getById(id, estateId);
    const row = (res as any)?.data ?? res;
    return row ? toPersonnel(row) : undefined;
  },

  async stats(estateId) {
    // No stats endpoint; derive from a wide page.
    const res = await securityPersonnelApi.list(estateId, { pageSize: 500 });
    const rows = parseList(res, "personnel", "users", "result", "data").map(toPersonnel);
    return {
      totalGuards: rows.length,
      activeGuards: rows.filter((r) => r.status === "ACTIVE").length,
      onDuty: rows.filter((r) => r.status === "ACTIVE").length,
      suspended: rows.filter((r) => r.status === "SUSPENDED").length,
    };
  },

  async create(dto, estateId) {
    const body: OnboardPersonnelDto = {
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      email: dto.email.trim(),
      phoneNumber: dto.phoneNumber.trim(),
      gender: dto.gender as OnboardPersonnelDto["gender"],
      documentType: dto.documentType as OnboardPersonnelDto["documentType"],
      documentNumber: dto.documentNumber.trim(),
    };
    const res = await securityPersonnelApi.onboard(estateId, body);
    return toPersonnel((res as any)?.data ?? res ?? body);
  },

  setStatus(id, status) {
    return status === "SUSPENDED"
      ? securityPersonnelApi.softDelete(id)
      : securityPersonnelApi.restore(id);
  },
};

export const securityApi: SecurityApi = USE_MOCKS ? (securityMockApi as unknown as SecurityApi) : securityRealApi;
export const SECURITY_IS_MOCK = USE_MOCKS;
export const resetSecurityMocks = () => securityMockApi.reset();
