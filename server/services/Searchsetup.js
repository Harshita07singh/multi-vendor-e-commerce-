import { ensureIndexes, syncIndexes } from "./SearchService.js";

export async function setupSearch() {
  try {
    await ensureIndexes();
    console.log("[Search] ES indexes ready ✓");

    // Full sync on startup (runs async so it doesn't delay server boot)
    syncIndexes().catch((err) =>
      console.error("[Search] Initial sync failed:", err.message),
    );
  } catch (err) {
    // ES being down should NOT crash the server
    console.warn(
      "[Search] Elasticsearch unavailable — search disabled:",
      err.message,
    );
  }
}
