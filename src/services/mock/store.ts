/** Bump to discard every persisted mock collection after a shape change. */
const SCHEMA_VERSION = 1;
const PREFIX = `mock:v${SCHEMA_VERSION}:`;

const LATENCY = { min: 220, max: 600 };

export function simulateLatency(): Promise<void> {
  const ms = LATENCY.min + Math.random() * (LATENCY.max - LATENCY.min);
  return new Promise((r) => setTimeout(r, ms));
}

function purgeOldVersions() {
  try {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith("mock:v") && !key.startsWith(PREFIX)) localStorage.removeItem(key);
    }
  } catch { /* storage unavailable */ }
}

export interface MockStore<T extends { id: string }> {
  all(): T[];
  find(id: string): T | undefined;
  insert(item: T): T;
  update(id: string, patch: Partial<T>): T | undefined;
  remove(id: string): void;
  reset(): void;
}

/**
 * localStorage-backed collection. Persisted so a record created through a
 * wizard survives the next HMR reload — in-memory made the wizards untestable.
 */
export function createMockStore<T extends { id: string }>(name: string, seed: T[]): MockStore<T> {
  purgeOldVersions();
  const key = PREFIX + name;
  let cache: T[] | null = null;

  const read = (): T[] => {
    if (cache) return cache;
    try {
      const raw = localStorage.getItem(key);
      cache = raw ? (JSON.parse(raw) as T[]) : [...seed];
    } catch {
      cache = [...seed];
    }
    return cache!;
  };

  const write = (items: T[]) => {
    cache = items;
    try {
      localStorage.setItem(key, JSON.stringify(items));
    } catch {
      // Quota or private mode — stay in memory for this session.
    }
  };

  return {
    all: () => [...read()],
    find: (id) => read().find((x) => x.id === id),
    insert(item) { write([item, ...read()]); return item; },
    update(id, patch) {
      const items = read().map((x) => (x.id === id ? { ...x, ...patch } : x));
      write(items);
      return items.find((x) => x.id === id);
    },
    remove(id) { write(read().filter((x) => x.id !== id)); },
    reset() { write([...seed]); },
  };
}

/** Client-side paging so a mock list matches a future server-paged contract. */
export function paginate<T>(items: T[], page = 1, pageSize = 10) {
  const start = (page - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), total: items.length, page, pageSize };
}
