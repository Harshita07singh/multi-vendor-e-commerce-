/**
 * search_controller.js
 *
 * Express controller for the unified search API.
 * Mount this router at /api/search
 *
 * Routes:
 *   GET /api/search?q=...&size=5          → full search (categories + subcategories + products)
 *   GET /api/search/autocomplete?q=...    → fast prefix suggestions
 *   POST /api/search/reindex              → trigger full ES re-index (admin only)
 */

import express from "express";
import {
  searchAll,
  autocomplete,
  syncIndexes,
} from "../services/SearchService.js";
import _ from "lodash";

export const searchRouter = express.Router();

// ─── GET /api/search ──────────────────────────────────────────────────────────

searchRouter.get("/", async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    const size = Math.min(Math.max(parseInt(req.query.size) || 5, 1), 20);

    if (!q || q.length < 1) {
      return res.json({
        categories: [],
        subCategories: [],
        products: [],
        total: 0,
      });
    }

    const results = await searchAll(q, { size });

    // ── Shape response for the frontend ──────────────────────────────
    // Each result gets a `url` field so the frontend can navigate directly
    const shaped = {
      ...results,
      // Route: /category/:categoryId/:categoryName
      categories: results.categories.map((c) => ({
        ...c,
        url: `/category/${c._id}/${encodeURIComponent(c.name)}`,
      })),
      // Route: /subcategory/:subCategoryId/:subCategoryName
      subCategories: results.subCategories.map((s) => ({
        ...s,
        url: `/subcategory/${s._id}/${encodeURIComponent(s.name)}`,
      })),
      // Route: /product/:slug
      products: results.products.map((p) => ({
        ...p,
        url: `/product/${p.slug}`,
      })),
    };

    res.json(shaped);
  } catch (err) {
    const msg = err?.message || err?.toString() || "Unknown error";
    console.error("[Search] Error:", msg);
    res.status(500).json({ message: "Search failed", error: msg });
  }
});

// ─── GET /api/search/autocomplete ─────────────────────────────────────────────

searchRouter.get("/autocomplete", async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q || q.length < 2) return res.json([]);

    const suggestions = await autocomplete(q);
    res.json(suggestions);
  } catch (err) {
    console.error("[Search] Autocomplete error:", err.message);
    res.json([]); // fail silently — don't break the UI
  }
});

// ─── POST /api/search/reindex  (superadmin only) ──────────────────────────────

searchRouter.post("/reindex", async (req, res) => {
  // Basic role guard — wire up your actual auth middleware in routes/index.js
  if (req.user?.role !== "superadmin") {
    return res.status(403).json({ message: "Forbidden" });
  }

  try {
    // Run async, don't block the response
    syncIndexes().catch((err) =>
      console.error("[ES] Background re-index failed:", err.message),
    );
    res.json({ message: "Re-index started in background" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
