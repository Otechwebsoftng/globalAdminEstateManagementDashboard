import type { EntityStatus } from "./common";

export type Shift = "MORNING" | "AFTERNOON" | "NIGHT";
export const SHIFTS: Shift[] = ["MORNING", "AFTERNOON", "NIGHT"];
export const shiftLabel = (s: Shift) =>
  ({ MORNING: "Morning", AFTERNOON: "Afternoon", NIGHT: "Night" }[s]);

export type Gate = "GATE_A" | "GATE_B" | "GATE_C";
export const GATES: Gate[] = ["GATE_A", "GATE_B", "GATE_C"];
export const gateLabel = (g: Gate) =>
  ({ GATE_A: "Gate A", GATE_B: "Gate B", GATE_C: "Gate C" }[g]);

/** Matches OnboardPersonnelDto.documentType on the backend. */
export type DocumentType = "NIN" | "PASSPORT" | "BVN" | "DRIVER_LICENSE";
export const DOCUMENT_TYPES: DocumentType[] = ["NIN", "PASSPORT", "BVN", "DRIVER_LICENSE"];
export const documentTypeLabel = (d: DocumentType) =>
  ({ NIN: "NIN", PASSPORT: "Passport", BVN: "BVN", DRIVER_LICENSE: "Driver's License" }[d]);

/** Required by the backend; not shown in the mockup. */
export type Gender = "male" | "female" | "others";
export const GENDERS: Gender[] = ["male", "female", "others"];
export const genderLabel = (g: Gender) =>
  ({ male: "Male", female: "Female", others: "Others" }[g]);

export interface VerificationLog {
  id: string;
  visitorName: string;
  code: string;
  time: string;
  gate: Gate;
  result: "VERIFIED" | "DENIED";
}

export interface SecurityPersonnel {
  id: string;
  /** Display badge id, e.g. "SVE-1234". */
  reference: string;
  firstName: string;
  lastName: string;
  email: string;
  countryCode: string;
  phoneNumber: string;
  documentType: DocumentType;
  documentNumber: string;
  gender: Gender;
  assignedGate: Gate;
  shift: Shift;
  status: EntityStatus;
  estateId: string;
  estateName: string;
  dateAdded: string;
  lastActivity: string;
  lastActiveAt: string;
  totalVerifications: number;
  todaysVerifications: number;
  attendanceRate: number;
  verificationLogs: VerificationLog[];
}

/**
 * Mirrors OnboardPersonnelDto exactly.
 *
 * The mockup also shows "Assigned Gate" and "Setup Password"; the backend has
 * no field for either (it issues its own invitation), so they are not collected.
 */
export interface CreateSecurityPersonnelDto {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  gender: Gender | "";
  documentType: DocumentType | "";
  documentNumber: string;
}

export interface SecurityStats {
  totalGuards: number;
  activeGuards: number;
  onDuty: number;
  suspended: number;
}
