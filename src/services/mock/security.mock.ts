// MOCK — no security-personnel endpoints exist in backend.json.
// Shapes mirror what the real API should return; see securityApi.ts.
import { createMockStore, paginate, simulateLatency } from "./store";
import type { SecurityPersonnel, VerificationLog } from "../../types/security";
import type { ListParams, Paged } from "../../types/common";

const NAMES: Array<[string, string]> = [
  ["Abayomi", "Williams"], ["Adaeze", "Nwosu"], ["Artur", "Balogun"], ["Akanni", "Osun"],
  ["Baba", "Bmiduye"], ["Bashir", "Falana"], ["Bamidele", "Ajayi"], ["Benjamin", "Ugochi"],
  ["Bunmi", "Iweala"], ["Obi", "Jack"], ["Chidi", "Okeke"], ["Ngozi", "Eze"],
];

const logs = (n: number): VerificationLog[] =>
  Array.from({ length: n }, (_, i) => ({
    id: `vl-${i}`,
    visitorName: ["Chikwendu Emmanuel", "Emmanuel Obi", "Ugochukwu Ada"][i % 3],
    code: "A8F3-K9L2",
    time: `10:0${i % 10}AM, Mar 14, 2026`,
    gate: (["GATE_A", "GATE_B"] as const)[i % 2],
    result: i % 7 === 6 ? ("DENIED" as const) : ("VERIFIED" as const),
  }));

const SEED: SecurityPersonnel[] = NAMES.map(([first, last], i) => ({
  id: `sp-${i + 1}`,
  reference: `SVE-${1234 + i}`,
  firstName: first,
  lastName: last,
  email: `${first.toLowerCase()}@sunsetvalley.ng`,
  countryCode: "+234",
  phoneNumber: `80355507${String(10 + i).slice(-2)}`,
  documentType: (["NIN", "BVN", "PASSPORT", "DRIVER_LICENSE"] as const)[i % 4],
  documentNumber: `${10045670 + i}`,
  gender: (["male", "female", "others"] as const)[i % 3],
  assignedGate: (["GATE_A", "GATE_B", "GATE_C"] as const)[i % 3],
  shift: (["NIGHT", "MORNING", "AFTERNOON"] as const)[i % 3],
  status: i === 4 || i === 9 ? "SUSPENDED" : i === 7 ? "PENDING" : "ACTIVE",
  estateId: "e1",
  estateName: "Sunset Valley Residences",
  dateAdded: "Apr 14, 2026",
  lastActivity: "Verified a code 2m ago",
  lastActiveAt: "2mins ago",
  totalVerifications: 50 - i,
  todaysVerifications: (i % 4) + 1,
  attendanceRate: 88 - (i % 5),
  verificationLogs: logs(8),
}));

const store = createMockStore<SecurityPersonnel>("security", SEED);

const matches = (p: SecurityPersonnel, params: ListParams) => {
  const q = params.search?.trim().toLowerCase();
  if (q) {
    const hay = [p.reference, p.firstName, p.lastName, p.email, p.assignedGate, p.shift]
      .join(" ").toLowerCase();
    if (!hay.includes(q)) return false;
  }
  if (params.status && params.status !== "All" && p.status !== params.status) return false;
  if (params.shift && params.shift !== "All" && p.shift !== params.shift) return false;
  if (params.estateId && params.estateId !== "All" && p.estateId !== params.estateId) return false;
  return true;
};

export const securityMockApi = {
  async list(params: ListParams = {}): Promise<Paged<SecurityPersonnel>> {
    await simulateLatency();
    const filtered = store.all().filter((p) => matches(p, params));
    return paginate(filtered, params.page ?? 1, params.pageSize ?? 10);
  },

  async getById(id: string): Promise<SecurityPersonnel | undefined> {
    await simulateLatency();
    return store.find(id);
  },

  async stats() {
    await simulateLatency();
    const all = store.all();
    return {
      totalGuards: all.length,
      activeGuards: all.filter((p) => p.status === "ACTIVE").length,
      onDuty: all.filter((p) => p.status === "ACTIVE" && p.shift === "MORNING").length,
      suspended: all.filter((p) => p.status === "SUSPENDED").length,
    };
  },

  async create(dto: any): Promise<SecurityPersonnel> {
    await simulateLatency();
    const all = store.all();
    if (all.some((p) => p.email.toLowerCase() === String(dto.email).toLowerCase())) {
      const err: any = new Error("A security personnel with this email already exists.");
      err.status = 409;
      throw err;
    }
    const created: SecurityPersonnel = {
      id: `sp-${Date.now()}`,
      reference: `SVE-${1234 + all.length}`,
      firstName: dto.firstName, lastName: dto.lastName, email: dto.email,
      countryCode: dto.countryCode, phoneNumber: dto.phoneNumber,
      documentType: dto.documentType, documentNumber: dto.documentNumber,
      gender: dto.gender,
      assignedGate: dto.assignedGate, shift: "MORNING",
      status: "PENDING",
      estateId: "e1", estateName: "Sunset Valley Residences",
      dateAdded: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      lastActivity: "Invitation sent",
      lastActiveAt: "--",
      totalVerifications: 0, todaysVerifications: 0, attendanceRate: 0,
      verificationLogs: [],
    };
    return store.insert(created);
  },

  async setStatus(id: string, status: SecurityPersonnel["status"]) {
    await simulateLatency();
    return store.update(id, { status });
  },

  reset: () => store.reset(),
};
