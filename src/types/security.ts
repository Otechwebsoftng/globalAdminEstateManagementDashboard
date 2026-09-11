import type { EntityStatus } from "./common";

export type Shift = "MORNING" | "AFTERNOON" | "NIGHT";
export const SHIFTS: Shift[] = ["MORNING", "AFTERNOON", "NIGHT"];
export const shiftLabel = (s: Shift) =>
  ({ MORNING: "Morning", AFTERNOON: "Afternoon", NIGHT: "Night" }[s]);

export type Gate = "GATE_A" | "GATE_B" | "GATE_C";
export const GATES: Gate[] = ["GATE_A", "GATE_B", "GATE_C"];
export const gateLabel = (g: Gate) =>
  ({ GATE_A: "Gate A", GATE_B: "Gate B", GATE_C: "Gate C" }[g]);

export type IdentityType = "NIN" | "BVN";
export const IDENTITY_TYPES: IdentityType[] = ["NIN", "BVN"];

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
  identityType: IdentityType;
  idNumber: string;
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

export interface CreateSecurityPersonnelDto {
  firstName: string;
  lastName: string;
  email: string;
  countryCode: string;
  phoneNumber: string;
  identityType: IdentityType | "";
  idNumber: string;
  assignedGate: Gate | "";
  password: string;
}

export interface SecurityStats {
  totalGuards: number;
  activeGuards: number;
  onDuty: number;
  suspended: number;
}
