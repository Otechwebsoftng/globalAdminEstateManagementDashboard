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

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

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

class ApiError extends Error {
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
    const parts: string[] = ["pageSize=100"];
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

  suspend(adminId: string) {
    return request<{ success: boolean; message: string }>(`/global-admin/${adminId}/suspend`, {
      method: "PATCH",
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
    const parts: string[] = ["pageSize=100"];
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

  suspend(adminId: string) {
    return request<{ success: boolean; message: string }>(`/estate-admin/${adminId}/suspend`, {
      method: "PATCH",
    });
  },
};

// ── Estate ────────────────────────────────────────────────────

export const estateApi = {
  list() {
    return request<ApiPaginatedResponse<Estate>>("/estate");
  },

  getById(estateId: string) {
    return request<ApiSingleResponse<Estate>>(`/estate/${estateId}`);
  },

  onboard(data: CreateEstateDto) {
    return request<ApiSingleResponse<Estate>>("/estate/onboard-estate", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update(id: string, data: EditEstateDto) {
    return request<ApiSingleResponse<Estate>>(`/estate/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  getResidents(estateId: string) {
    return request<ApiPaginatedResponse<Resident>>(`/estate/${estateId}/residents`);
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
