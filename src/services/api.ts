import type {
  LoginDto,
  ActivateAccountDto,
  ResendOTPDto,
  SendPasswordOtpDto,
  ResetPasswordDto,
  CreateEstateDto,
  EditEstateDto,
  CreateAdminDto,
  CreateEstateAdminDto,
  UpdateAdminRoleDto,
  UpdateEstateAdminRoleDto,
  CreateRoleDto,
  UpdateRoleDto,
  CreateMenuDto,
  LoginResponse,
  VerifyOtpResponse,
  DashboardResponse,
  Estate,
  Resident,
  Admin,
  Role,
  Permission,
  MenuItem,
  ApiPaginatedResponse,
  ApiSingleResponse,
} from "../types/api";

const API_PREFIX = "/api/v1";

/** Builds a query string, dropping undefined/empty values. */
export function qs(params?: Record<string, unknown>): string {
  if (!params) return "";
  const parts = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== "" && v !== "All")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  return parts.length ? `?${parts.join("&")}` : "";
}

const normalizeBaseUrl = (value?: string) => {
  const trimmed = value?.trim().replace(/\/+$/, "");
  if (!trimmed) return API_PREFIX;
  return trimmed.endsWith(API_PREFIX) ? trimmed : `${trimmed}${API_PREFIX}`;
};

const BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL as string | undefined);

let authToken: string | null = localStorage.getItem("global_estates_token");
let onSessionExpired: (() => void) | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem("global_estates_token", token);
  } else {
    localStorage.removeItem("global_estates_token");
  }
}

export function setOnSessionExpired(callback: (() => void) | null) {
  onSessionExpired = callback;
}

export function getAuthToken(): string | null {
  return authToken;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  mfaToken?: string
): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (mfaToken) {
    headers["Authorization"] = `Bearer ${mfaToken}`;
  } else if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    if ((res.status === 401 || res.status === 403) && !mfaToken && onSessionExpired) {
      onSessionExpired();
    }
    let errorMessage = `Request failed (${res.status})`;
    try {
      const errorBody = await res.json();
      if (typeof errorBody.message === "string") {
        errorMessage = errorBody.message;
      } else if (typeof errorBody.message === "object" && errorBody.message?.message) {
        errorMessage = errorBody.message.message;
      } else if (typeof errorBody.error === "string") {
        errorMessage = errorBody.error;
      }
    } catch {
      // ignore parse error
    }
    throw new ApiError(errorMessage, res.status);
  }

  const text = await res.text();
  if (!text) return {} as T;
  return JSON.parse(text);
}

// ── Auth ──────────────────────────────────────────────────────

export const authApi = {
  loginGlobalAdmin(data: LoginDto) {
    return request<LoginResponse>("/auth/global-admin/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  loginEstateAdmin(data: LoginDto) {
    return request<LoginResponse>("/auth/estate-admin/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  verifyOtp(data: ActivateAccountDto, mfaToken?: string) {
    return request<any>("/auth/admin/verify-user", {
      method: "PATCH",
      body: JSON.stringify(data),
    }, mfaToken);
  },

  resendOtp(data: ResendOTPDto) {
    return request<{ success: boolean; message: string }>("/global-admin/resend-otp", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  forgotPassword(data: SendPasswordOtpDto) {
    return request<{ success: boolean; message: string }>("/global-admin/forgot-password", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  verifyPasswordOtp(data: ActivateAccountDto) {
    return request<{ success: boolean; message: string }>("/global-admin/verify-password-otp", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  resetPassword(otp: string, data: ResetPasswordDto) {
    return request<{ success: boolean; message: string }>(`/global-admin/reset-password/${otp}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
};

// ── Global Admin ──────────────────────────────────────────────

export const globalAdminApi = {
  getDashboard() {
    return request<DashboardResponse>("/global-admin/dashboard");
  },

  list(params?: { status?: string }) {
    const parts: string[] = ["pageSize=500"];
    if (params?.status) parts.push(`userStatus=${params.status}`);
    return request<any>(`/global-admin?${parts.join("&")}`);
  },

  getById(adminId: string) {
    return request<ApiSingleResponse<Admin>>(`/global-admin/${adminId}`);
  },

  onboard(data: CreateAdminDto) {
    return request<ApiSingleResponse<Admin>>("/global-admin/onboard-admin", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateRole(adminId: string, data: UpdateAdminRoleDto) {
    return request<ApiSingleResponse<Admin>>(`/global-admin/${adminId}/update-role`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  softDelete(adminId: string) {
    return request<{ success: boolean; message: string }>(`/global-admin/${adminId}/soft-delete`, {
      method: "PATCH",
    });
  },

  restore(adminId: string) {
    return request<{ success: boolean; message: string }>(`/global-admin/${adminId}/restore`, {
      method: "PATCH",
    });
  },

  /**
   * The backend has no /suspend route; soft-delete is the deactivation that
   * pairs with restore, so "Suspend" in the UI maps here.
   */
  suspend(adminId: string) {
    return request<{ success: boolean; message: string }>(`/global-admin/${adminId}/soft-delete`, {
      method: "PATCH",
    });
  },

  remove(adminId: string) {
    return request<{ success: boolean; message: string }>(`/global-admin/${adminId}`, {
      method: "DELETE",
    });
  },

  editProfile(data: CreateAdminDto) {
    return request<ApiSingleResponse<Admin>>("/global-admin/edit-profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
};

// ── Estate Admin ──────────────────────────────────────────────

export const estateAdminApi = {
  list(params?: { status?: string }) {
    const parts: string[] = ["pageSize=500"];
    if (params?.status) parts.push(`userStatus=${params.status}`);
    return request<any>(`/estate-admin?${parts.join("&")}`);
  },

  getById(adminId: string) {
    return request<ApiSingleResponse<Admin>>(`/estate-admin/${adminId}`);
  },

  onboard(data: CreateEstateAdminDto) {
    return request<ApiSingleResponse<Admin>>("/estate-admin/onboard-admin", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateRole(adminId: string, data: UpdateAdminRoleDto) {
    return request<ApiSingleResponse<Admin>>(`/estate-admin/${adminId}/update-role`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  softDelete(adminId: string) {
    return request<{ success: boolean; message: string }>(`/estate-admin/${adminId}/soft-delete`, {
      method: "PATCH",
    });
  },

  restore(adminId: string) {
    return request<{ success: boolean; message: string }>(`/estate-admin/${adminId}/restore`, {
      method: "PATCH",
    });
  },

  /** See the note on globalAdminApi.suspend — there is no /suspend route. */
  suspend(adminId: string) {
    return request<{ success: boolean; message: string }>(`/estate-admin/${adminId}/soft-delete`, {
      method: "PATCH",
    });
  },

  remove(adminId: string) {
    return request<{ success: boolean; message: string }>(`/estate-admin/${adminId}/delete`, {
      method: "DELETE",
    });
  },
};

// ── Estate ────────────────────────────────────────────────────

export const estateApi = {
  list(params?: { page?: number; pageSize?: number; search?: string; status?: string; state?: string }) {
    return request<ApiPaginatedResponse<Estate>>(`/estates${qs(params)}`);
  },

  getById(estateId: string) {
    return request<ApiSingleResponse<Estate>>(`/estates/${estateId}`);
  },

  onboard(data: CreateEstateDto) {
    return request<ApiSingleResponse<Estate>>("/estates/onboard-estate", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update(estateId: string, data: EditEstateDto) {
    return request<ApiSingleResponse<Estate>>(`/estates/${estateId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  softDelete(estateId: string) {
    return request<ApiSingleResponse<Estate>>(`/estates/${estateId}/soft-delete`, { method: "PATCH" });
  },

  restore(estateId: string) {
    return request<ApiSingleResponse<Estate>>(`/estates/${estateId}/restore-estate`, { method: "PATCH" });
  },

  remove(estateId: string) {
    return request<{ success: boolean; message: string }>(`/estates/${estateId}/delete`, { method: "DELETE" });
  },

  getResidents(
    estateId: string,
    params?: { page?: number; pageSize?: number; status?: string; search?: string },
  ) {
    return request<ApiPaginatedResponse<Resident>>(`/estates/${estateId}/residents${qs(params)}`);
  },

  getEstateAdmin(estateId: string, adminId: string) {
    return request<ApiSingleResponse<Admin>>(`/estates/${estateId}/estate-admin/${adminId}`);
  },
};

// ── Role ──────────────────────────────────────────────────────

export const roleApi = {
  list() {
    return request<ApiPaginatedResponse<Role>>("/role");
  },

  getById(roleId: string) {
    return request<ApiSingleResponse<Role>>(`/role/${roleId}`);
  },

  create(data: CreateRoleDto) {
    return request<ApiSingleResponse<Role>>("/role", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update(roleId: string, data: UpdateRoleDto) {
    return request<ApiSingleResponse<Role>>(`/role/${roleId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete(roleId: string) {
    return request<{ success: boolean; message: string }>(`/role/${roleId}`, {
      method: "DELETE",
    });
  },
};

// ── Permission ────────────────────────────────────────────────

export const permissionApi = {
  list() {
    return request<ApiPaginatedResponse<Permission>>("/permission");
  },

  getBySlug(slug: string) {
    return request<ApiSingleResponse<Permission>>(`/permission/slug?slug=${slug}`);
  },
};

// ── Menu ──────────────────────────────────────────────────────

export const menuApi = {
  list() {
    return request<ApiPaginatedResponse<MenuItem>>("/menu");
  },

  create(data: CreateMenuDto) {
    return request<ApiSingleResponse<MenuItem>>("/menu", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  createChild(parentId: string, data: CreateMenuDto) {
    return request<ApiSingleResponse<MenuItem>>(`/menu/${parentId}/child-menu`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

// ── Security Personnel ────────────────────────────────────────
// All estate-scoped: the estate admin's own estateId, or the estate being viewed.

export interface OnboardPersonnelDto {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  gender: "male" | "female" | "others";
  email: string;
  documentType: "NIN" | "PASSPORT" | "BVN" | "DRIVER_LICENSE";
  documentNumber: string;
}

export const securityPersonnelApi = {
  list(
    estateId: string,
    params?: { page?: number; pageSize?: number; status?: string; search?: string },
  ) {
    return request<any>(`/security-personnel/estate/${estateId}${qs(params)}`);
  },

  getById(userId: string, estateId: string) {
    return request<any>(`/security-personnel/${userId}/estate/${estateId}`);
  },

  onboard(estateId: string, data: OnboardPersonnelDto) {
    return request<any>(`/security-personnel/estate/${estateId}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateProfile(data: Partial<OnboardPersonnelDto>) {
    return request<any>("/security-personnel/update-profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  softDelete(userId: string) {
    return request<any>(`/security-personnel/${userId}/soft-delete`, { method: "PATCH" });
  },

  restore(userId: string) {
    return request<any>(`/security-personnel/${userId}/restore`, { method: "PATCH" });
  },

  removeFromEstate(userId: string, estateId: string) {
    return request<any>(`/security-personnel/${userId}/estate/${estateId}/remove`, { method: "PATCH" });
  },

  remove(userId: string, estateId: string) {
    return request<any>(`/security-personnel/${userId}/estate/${estateId}`, { method: "DELETE" });
  },

  /** Gate check — a guard verifies a visitor's access code. */
  verifyCode(data: { code: string }) {
    return request<any>("/security-personnel/verify-code", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

// ── Resident Assets (properties) ──────────────────────────────

export const PROPERTY_TYPE_VALUES = [
  "Duplex", "Apartments", "Shortlet", "Hotel", "SuperMarket",
  "School", "Hospital", "Church", "Office",
] as const;
export type ApiPropertyType = (typeof PROPERTY_TYPE_VALUES)[number];

export type ApiPropertyStatus = "available" | "occupied" | "unavailable" | "reserved";

/** The owner block the create endpoint nests inside ResidentFixedAssetDto. */
export interface AssetOwnerDto {
  firstName: string;
  lastName: string;
  countryCode: string;
  phoneNumber: string;
  email: string;
  propertyId: string;
  startDate: string;
  endDate: string;
}

export interface ResidentFixedAssetDto {
  propertyType: ApiPropertyType;
  propertyName: string;
  propertyNumber: string;
  houseNumber: string;
  numberOfRooms: number;
  floorNumber: number;
  numberOfFloors: number;
  description: string;
  address: string;
  street: string;
  city: string;
  state: string;
  country: string;
  isForRent: boolean;
  isForSale: boolean;
  owner: AssetOwnerDto;
}

export type UpdatePropertyDto = Partial<Omit<ResidentFixedAssetDto, "owner">> & {
  propertyStatus?: ApiPropertyStatus;
};

export const residentAssetApi = {
  list(
    estateId: string,
    params?: { page?: number; pageSize?: number; status?: string; propertyType?: string; search?: string },
  ) {
    return request<any>(`/resident-assets/estate/${estateId}${qs(params)}`);
  },

  getById(propertyId: string, estateId: string) {
    return request<any>(`/resident-assets/${propertyId}/estate/${estateId}`);
  },

  create(estateId: string, data: ResidentFixedAssetDto) {
    return request<any>(`/resident-assets/estate/${estateId}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update(propertyId: string, estateId: string, data: UpdatePropertyDto) {
    return request<any>(`/resident-assets/${propertyId}/estate/${estateId}/update`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  /** "Temporarily Remove" — requires a reason. */
  softDelete(propertyId: string, estateId: string, reason: string) {
    return request<any>(`/resident-assets/${propertyId}/estate/${estateId}/soft-delete`, {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    });
  },

  restore(propertyId: string, estateId: string) {
    return request<any>(`/resident-assets/${propertyId}/estate/${estateId}/restore`, { method: "PATCH" });
  },

  remove(propertyId: string, estateId: string) {
    return request<any>(`/resident-assets/${propertyId}/estate/${estateId}/delete`, { method: "DELETE" });
  },

  /** Unassign a resident from a property. */
  removeOccupant(userId: string, estateId: string, propertyId: string) {
    return request<any>(
      `/resident-assets/${userId}/estate/${estateId}/property/${propertyId}/remove`,
      { method: "PATCH" },
    );
  },
};

// ── Residents ─────────────────────────────────────────────────

export interface VisitorCodeDto {
  firstName: string;
  lastName: string;
  entryTime: string;
  exitTime: string;
}

export const residentApi = {
  list(
    estateId: string,
    params?: { page?: number; pageSize?: number; status?: string; search?: string },
  ) {
    return request<any>(`/residents/estate/${estateId}${qs(params)}`);
  },

  getById(userId: string) {
    return request<any>(`/residents/${userId}`);
  },

  update(userId: string, estateId: string, data: Record<string, unknown>) {
    return request<any>(`/residents/${userId}/estate/${estateId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  removeAssignment(userId: string, estateId: string) {
    return request<any>(`/residents/${userId}/estate/${estateId}/remove-assignment`, { method: "PATCH" });
  },

  /** Residents generate visitor codes for their guests. */
  createVisitorCode(estateId: string, data: VisitorCodeDto) {
    return request<any>(`/residents/estate/${estateId}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
