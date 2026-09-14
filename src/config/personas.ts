export type Persona = "GLOBAL_ADMIN" | "ESTATE_ADMIN" | "RESIDENT" | "SECURITY";

/** Where each persona lands after login, and where a wrong-tree URL bounces to. */
export const homePathFor = (persona: Persona | null | undefined): string => {
  switch (persona) {
    case "ESTATE_ADMIN": return "/estate/dashboard";
    case "RESIDENT": return "/resident/dashboard";
    case "SECURITY": return "/security/dashboard";
    default: return "/admin/dashboard";
  }
};

export const personaLabel = (persona: Persona | null | undefined): string => {
  switch (persona) {
    case "ESTATE_ADMIN": return "Estate Administrator";
    case "RESIDENT": return "Resident";
    case "SECURITY": return "Security Personnel";
    default: return "Global Administrator";
  }
};

/** Which password-reset route group an account type uses. */
export const passwordScopeFor = (persona: Persona | null | undefined) => {
  switch (persona) {
    case "ESTATE_ADMIN": return "estate-admin" as const;
    case "RESIDENT": return "residents" as const;
    // Security personnel have no reset routes of their own.
    default: return "global-admin" as const;
  }
};

export const PERSONA_OPTIONS: Array<{ key: Persona; label: string }> = [
  { key: "GLOBAL_ADMIN", label: "Platform Admin" },
  { key: "ESTATE_ADMIN", label: "Estate Admin" },
  { key: "RESIDENT", label: "Resident" },
  { key: "SECURITY", label: "Security" },
];
