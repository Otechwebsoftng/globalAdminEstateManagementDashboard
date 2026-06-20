// API Types matching backend OpenAPI schema

export interface LoginDto {
  email: string;
  password: string;
}

export interface ActivateAccountDto {
  otpType: "SIGN_UP" | "CHANGE_PASSWORD" | "FORGOT_PASSWORD" | "ADMIN_LOGIN";
  otp: string;
  email: string;
}

export interface ResendOTPDto {
  otpType: "SIGN_UP" | "CHANGE_PASSWORD" | "FORGOT_PASSWORD" | "ADMIN_LOGIN";
  email: string;
}

export interface SendPasswordOtpDto {
  email: string;
}

export interface ResetPasswordDto {
  password: string;
  email: string;
}

export interface CreateEstateDto {
  estateName: string;
  firstName: string;
  lastName: string;
  cac: string;
  countryCode: string;
  phoneNumber: string;
  email: string;
  address: string;
  city: string;
  state: string;
  country: string;
}

export interface EditEstateDto {
  estateName: string;
  cac: string;
  address: string;
  lga: string;
  city: string;
  state: string;
  country: string;
}

export interface CreateAdminDto {
  firstName: string;
  lastName: string;
  email: string;
  countryCode: string;
  phoneNumber: string;
  roleId: string;
}

export interface CreateEstateAdminDto {
  firstName: string;
  lastName: string;
  email: string;
  roleId: string;
}

export interface UpdateAdminRoleDto {
  roleId: string;
}

export interface UpdateEstateAdminRoleDto {
  roleId: string;
}

export interface CreateRoleDto {
  name: string;
  description: string;
  permissionIds: string[];
}

export interface UpdateRoleDto {
  name: string;
  description: string;
  permissionIds: string[];
}

export interface CreateMenuDto {
  name: string;
  url: string;
  icon: string;
  order: number;
  parentId?: string;
  permissions: string[];
}

// API Response types
export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    mfaToken: string;
    email: string;
  };
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    user: ApiUser;
  };
}

export interface ApiUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: {
    id: string;
    name: string;
    permissions?: Array<{ id: string; name: string; slug: string }>;
  };
}

export interface DashboardResponse {
  success: boolean;
  data: {
    totalEstates: number;
    totalResidents: number;
    totalStaff: number;
    recentActivity: Array<{
      id: string;
      action: string;
      estate: string;
      time: string;
    }>;
  };
}

export interface Estate {
  id: string;
  estateName: string;
  firstName: string;
  lastName: string;
  cac: string;
  countryCode: string;
  phoneNumber: string;
  email: string;
  address: string;
  city: string;
  state: string;
  country: string;
  createdAt: string;
  updatedAt: string;
}

export interface Resident {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  houseNo: string;
  estateId: string;
  estateName?: string;
  status: string;
  createdAt: string;
}

export interface Admin {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: {
    id: string;
    name: string;
  };
  status: string;
  createdAt: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions?: Array<{ id: string; name: string; slug: string }>;
  createdAt: string;
}

export interface Permission {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface MenuItem {
  id: string;
  name: string;
  url: string;
  icon: string;
  order: number;
  parentId?: string;
  children?: MenuItem[];
  permissions?: Array<{ id: string; name: string }>;
}

export interface ApiPaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface ApiSingleResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
