export type Persona = "GLOBAL_ADMIN" | "ESTATE_ADMIN";

/** Where each persona lands after login, and where a wrong-tree URL bounces to. */
export const homePathFor = (persona: Persona | null | undefined): string =>
  persona === "ESTATE_ADMIN" ? "/estate/dashboard" : "/admin/dashboard";

export const personaLabel = (persona: Persona | null | undefined): string =>
  persona === "ESTATE_ADMIN" ? "Estate Administrator" : "Global Administrator";
