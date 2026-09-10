/**
 * Display formatting and defensive accessors for resident-shaped records.
 *
 * The backend returns residents in several shapes (`name` vs `firstName`/`lastName`,
 * `phone` vs `phoneNumber`), so these getters normalise rather than assuming one.
 */

export const formatDisplayDate = (value: unknown) => {
  if (!value) return "";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
};

export const getResidentName = (resident: any) =>
  resident?.name || `${resident?.firstName || ""} ${resident?.lastName || ""}`.trim();

export const getResidentPhone = (resident: any) => resident?.phone || resident?.phoneNumber || "";

export const getResidentEstate = (resident: any) => resident?.estate || resident?.estateName || "";

export const getResidentJoinedDate = (resident: any) =>
  resident?.joinedDate || formatDisplayDate(resident?.createdAt);

export const getResidentInitials = (resident: any) => {
  const name = getResidentName(resident);
  return name
    ? name.split(" ").filter(Boolean).map((part: string) => part[0]).join("").slice(0, 3).toUpperCase()
    : "R";
};
