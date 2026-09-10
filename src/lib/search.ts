/**
 * Client-side search helpers shared by every list view.
 *
 * `matchesSearchTerms` AND-matches across multiple independent queries (a page's
 * own search box plus the global topbar search), where each query must match at
 * least one of the supplied fields.
 */

export const toSearchText = (value: unknown) => String(value ?? "").toLowerCase();

export const matchesSearchTerms = (fields: unknown[], ...queries: string[]) => {
  const terms = queries.map((query) => query.trim().toLowerCase()).filter(Boolean);
  if (terms.length === 0) return true;
  return terms.every((term) => fields.some((field) => toSearchText(field).includes(term)));
};
