/**
 * searchService.js
 *
 * Unified search across Category, SubCategory, Product
 * Stack: Elasticsearch (via @elastic/elasticsearch) + ioredis (cache) + natural (NLP) + lodash
 *
 * Usage:
 *   import { indexDocument, searchAll, syncIndexes } from "./searchService.js";
 */

import { Client } from "@elastic/elasticsearch";
import Redis from "ioredis";
import natural from "natural";
import _ from "lodash";

import Category from "../models/Category.js";
import SubCategory from "../models/SubCategory.js";
import Product from "../models/Product.js";

// ─── Clients ──────────────────────────────────────────────────────────────────

export const esClient = new Client({
  node: process.env.ELASTICSEARCH_URL || "http://localhost:9200",
  auth: process.env.ELASTICSEARCH_API_KEY
    ? { apiKey: process.env.ELASTICSEARCH_API_KEY }
    : undefined,
  tls: process.env.ELASTICSEARCH_CA_CERT
    ? { ca: process.env.ELASTICSEARCH_CA_CERT }
    : undefined,
  requestTimeout: 5000, // don't hang requests for >5 s when ES is down
});

// ── ES health flag ────────────────────────────────────────────────────────────
// Set to true by ensureIndexes() on a successful connection.
// When false, searchAll() / autocomplete() fall back to MongoDB.
let _esAvailable = false;
export const isESAvailable = () => _esAvailable;
export const setESAvailable = (val) => {
  _esAvailable = val;
};

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: 2,
  enableOfflineQueue: false,
  lazyConnect: true,
});

redis.on("error", (err) => {
  // Don't crash the app if Redis is down — search still works without cache
  console.warn(
    "[Redis] Connection error (search cache disabled):",
    err.message,
  );
});

// ─── NLP helpers ──────────────────────────────────────────────────────────────

const stemmer = natural.PorterStemmer;
const tokenizer = new natural.WordTokenizer();

/**
 * Stem & clean a query string for better fuzzy matching.
 * "running shoes" → ["run", "shoe"]
 */
function normalizeQuery(query) {
  const tokens = tokenizer.tokenize(query.toLowerCase());
  return tokens.map((t) => stemmer.stem(t)).join(" ");
}

/**
 * Build phonetic variants using Double Metaphone for typo-tolerance.
 * "samsng" → "SMSNK" (close to "samsung" → "SMSNK")
 */
function phoneticExpand(query) {
  const tokens = tokenizer.tokenize(query.toLowerCase());
  return tokens
    .map((t) => {
      const codes = natural.DoubleMetaphone.process(t);
      return codes.filter(Boolean);
    })
    .flat();
}

// ─── Index names ──────────────────────────────────────────────────────────────

const INDEX = {
  category: "3arrow_categories",
  subCategory: "3arrow_subcategories",
  product: "3arrow_products",
};

// ─── Index mappings ───────────────────────────────────────────────────────────

const MAPPINGS = {
  [INDEX.category]: {
    mappings: {
      properties: {
        name: {
          type: "text",
          analyzer: "standard",
          fields: { keyword: { type: "keyword" } },
        },
        description: { type: "text", analyzer: "standard" },
        slug: { type: "keyword" },
        image: { type: "keyword", index: false },
        isActive: { type: "boolean" },
        margin: { type: "float" },
        vendorId: { type: "keyword" },
        type: { type: "keyword" }, // "category"
        updatedAt: { type: "date" },
      },
    },
    settings: {
      analysis: {
        analyzer: {
          standard: {
            type: "standard",
            stopwords: "_english_",
          },
        },
      },
    },
  },

  [INDEX.subCategory]: {
    mappings: {
      properties: {
        name: {
          type: "text",
          analyzer: "standard",
          fields: { keyword: { type: "keyword" } },
        },
        description: { type: "text", analyzer: "standard" },
        slug: { type: "keyword" },
        image: { type: "keyword", index: false },
        isActive: { type: "boolean" },
        categoryId: { type: "keyword" },
        categoryName: { type: "text" },
        categorySlug: { type: "keyword" },
        vendorId: { type: "keyword" },
        type: { type: "keyword" }, // "subCategory"
        updatedAt: { type: "date" },
      },
    },
  },

  [INDEX.product]: {
    mappings: {
      properties: {
        name: {
          type: "text",
          analyzer: "standard",
          fields: { keyword: { type: "keyword" } },
        },
        description: { type: "text", analyzer: "standard" },
        shortDescription: { type: "text" },
        brand: { type: "text", fields: { keyword: { type: "keyword" } } },
        slug: { type: "keyword" },
        tags: { type: "text" },
        sku: { type: "keyword" },
        price: { type: "float" },
        mrp: { type: "float" },
        discount: { type: "float" },
        isFeatured: { type: "boolean" },
        isActive: { type: "boolean" },
        ratingsAverage: { type: "float" },
        categoryId: { type: "keyword" },
        categoryName: { type: "text" },
        categorySlug: { type: "keyword" },
        subCategoryId: { type: "keyword" },
        subCategoryName: { type: "text" },
        subCategorySlug: { type: "keyword" },
        images: { type: "object", enabled: false },
        vendorId: { type: "keyword" },
        type: { type: "keyword" }, // "product"
        updatedAt: { type: "date" },
      },
    },
  },
};

// ─── Setup: create indexes if they don't exist ────────────────────────────────

export async function ensureIndexes() {
  for (const [indexName, body] of Object.entries(MAPPINGS)) {
    const exists = await esClient.indices.exists({ index: indexName });
    if (!exists) {
      await esClient.indices.create({ index: indexName, ...body });
      console.log(`[ES] Created index: ${indexName}`);
    }
  }
  // ── Mark ES reachable only after all indexes confirmed ────────────────────
  setESAvailable(true);
}

// ─── Document transformers ────────────────────────────────────────────────────

function transformCategory(doc) {
  return {
    _id: doc._id.toString(),
    type: "category",
    name: doc.name,
    description: doc.description || "",
    slug: doc.slug,
    image: doc.image,
    isActive: doc.isActive ?? true,
    margin: doc.margin ?? 0,
    vendorId: doc.vendor?.toString() || null,
    updatedAt: doc.updatedAt,
  };
}

function transformSubCategory(doc) {
  const cat = doc.category;
  return {
    _id: doc._id.toString(),
    type: "subCategory",
    name: doc.name,
    description: doc.description || "",
    slug: doc.slug,
    image: doc.image || "",
    isActive: doc.isActive ?? true,
    categoryId: cat?._id?.toString() || cat?.toString() || null,
    categoryName: cat?.name || "",
    categorySlug: cat?.slug || "",
    vendorId: doc.vendor?.toString() || null,
    updatedAt: doc.updatedAt,
  };
}

function transformProduct(doc) {
  const cat = doc.category;
  const sub = doc.subCategory;
  return {
    _id: doc._id.toString(),
    type: "product",
    name: doc.name,
    description: doc.description || "",
    shortDescription: doc.shortDescription || "",
    brand: doc.brand || "",
    slug: doc.slug,
    sku: doc.sku || "",
    tags: doc.tags || [],
    price: doc.price,
    mrp: doc.mrp,
    discount: doc.discount || 0,
    isFeatured: doc.isFeatured ?? false,
    isActive: doc.isActive ?? true,
    ratingsAverage: doc.ratingsAverage || 0,
    images: doc.images?.slice(0, 1) || [],
    categoryId: cat?._id?.toString() || cat?.toString() || null,
    categoryName: cat?.name || "",
    categorySlug: cat?.slug || "",
    subCategoryId: sub?._id?.toString() || sub?.toString() || null,
    subCategoryName: sub?.name || "",
    subCategorySlug: sub?.slug || "",
    vendorId: doc.vendor?.toString() || null,
    updatedAt: doc.updatedAt,
  };
}

// ─── Index a single document ──────────────────────────────────────────────────

export async function indexDocument(type, doc) {
  try {
    const indexName = INDEX[type];
    if (!indexName) throw new Error(`Unknown type: ${type}`);

    const transformers = {
      category: transformCategory,
      subCategory: transformSubCategory,
      product: transformProduct,
    };

    const body = transformers[type](doc);

    await esClient.index({
      index: indexName,
      id: body._id,
      document: body,
    });
  } catch (err) {
    console.error(`[ES] Failed to index ${type}:`, err.message);
  }
}

/**
 * Remove a document from ES index (call on delete/deactivate)
 */
export async function removeDocument(type, id) {
  try {
    const indexName = INDEX[type];
    if (!indexName) return;
    await esClient.delete({ index: indexName, id: id.toString() });
  } catch (err) {
    if (err.statusCode !== 404) {
      console.error(`[ES] Failed to remove ${type} ${id}:`, err.message);
    }
  }
}

// ─── Full re-index (run once or via cron) ─────────────────────────────────────

export async function syncIndexes() {
  console.log("[ES] Starting full re-index...");

  // Categories
  const categories = await Category.find({ isActive: true }).lean();
  const catOps = categories.flatMap((doc) => [
    { index: { _index: INDEX.category, _id: doc._id.toString() } },
    transformCategory(doc),
  ]);
  if (catOps.length) await esClient.bulk({ operations: catOps });
  console.log(`[ES] Indexed ${categories.length} categories`);

  // SubCategories
  const subs = await SubCategory.find({ isActive: true })
    .populate("category", "name slug")
    .lean();
  const subOps = subs.flatMap((doc) => [
    { index: { _index: INDEX.subCategory, _id: doc._id.toString() } },
    transformSubCategory(doc),
  ]);
  if (subOps.length) await esClient.bulk({ operations: subOps });
  console.log(`[ES] Indexed ${subs.length} subcategories`);

  // Products
  const products = await Product.find({ isActive: true, isDeleted: false })
    .populate("category", "name slug")
    .populate("subCategory", "name slug")
    .lean();
  const prodOps = products.flatMap((doc) => [
    { index: { _index: INDEX.product, _id: doc._id.toString() } },
    transformProduct(doc),
  ]);
  if (prodOps.length) await esClient.bulk({ operations: prodOps });
  console.log(`[ES] Indexed ${products.length} products`);

  console.log("[ES] Full re-index complete ✓");
}

// ─── MongoDB fallback search (used when ES is unavailable) ───────────────────

/**
 * Simple regex-based search against MongoDB.
 * Mirrors the shape that searchAll() returns so callers need no changes.
 */
async function mongoFallbackSearch(rawQuery, size = 5) {
  const regex = new RegExp(_.escapeRegExp(rawQuery.trim()), "i");

  const [categories, subCategories, products] = await Promise.all([
    Category.find({ isActive: true, name: regex })
      .select("name slug image description")
      .limit(size)
      .lean(),

    SubCategory.find({ isActive: true, name: regex })
      .populate("category", "name slug")
      .select("name slug image description category")
      .limit(size)
      .lean(),

    Product.find({ isActive: true, isDeleted: false })
      .or([
        { name: regex },
        { brand: regex },
        { tags: regex },
        { shortDescription: regex },
      ])
      .populate("category", "name slug")
      .populate("subCategory", "name slug")
      .select(
        "name slug brand price mrp discount ratingsAverage images isFeatured " +
          "description shortDescription category subCategory",
      )
      .sort({ isFeatured: -1, ratingsAverage: -1 })
      .limit(size)
      .lean(),
  ]);

  return {
    categories: categories.map((c) => ({
      _id: c._id.toString(),
      name: c.name,
      slug: c.slug,
      image: c.image,
      description: c.description || "",
      type: "category",
    })),
    subCategories: subCategories.map((s) => ({
      _id: s._id.toString(),
      name: s.name,
      slug: s.slug,
      image: s.image || "",
      description: s.description || "",
      categoryName: s.category?.name || "",
      categorySlug: s.category?.slug || "",
      type: "subCategory",
    })),
    products: products.map((p) => ({
      _id: p._id.toString(),
      name: p.name,
      slug: p.slug,
      brand: p.brand || "",
      price: p.price,
      mrp: p.mrp,
      discount: p.discount || 0,
      ratingsAverage: p.ratingsAverage || 0,
      images: p.images?.slice(0, 1) || [],
      isFeatured: p.isFeatured ?? false,
      description: p.description || "",
      shortDescription: p.shortDescription || "",
      categoryName: p.category?.name || "",
      categorySlug: p.category?.slug || "",
      subCategoryName: p.subCategory?.name || "",
      subCategorySlug: p.subCategory?.slug || "",
      type: "product",
    })),
    total: categories.length + subCategories.length + products.length,
    suggestion: null,
    query: rawQuery,
    _source: "mongodb", // debug hint — not used by frontend
  };
}

// ─── Core search ──────────────────────────────────────────────────────────────

/**
 * Main unified search function.
 *
 * @param {string} rawQuery      – User's search string
 * @param {object} options
 * @param {number} options.size  – Results per type (default 5)
 * @param {boolean} options.suggest – Include did-you-mean (default true)
 * @returns {object}             – { categories, subCategories, products, total, suggestion }
 */
export async function searchAll(rawQuery, options = {}) {
  const { size = 5, suggest = true } = options;

  if (!rawQuery?.trim())
    return { categories: [], subCategories: [], products: [], total: 0 };

  // ── Fallback to MongoDB when ES is not available ──────────────────
  if (!_esAvailable) {
    console.warn(
      "[Search] ES unavailable — using MongoDB fallback for query:",
      rawQuery,
    );
    return mongoFallbackSearch(rawQuery, size);
  }

  const query = rawQuery.trim();
  const cacheKey = `search:${query.toLowerCase()}:${size}`;

  // ── Try Redis cache ──────────────────────────────────────────────
  try {
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch (_) {}

  // ── Build ES multi-search body ───────────────────────────────────
  // Uses lodash to safely build the queries

  const buildTextQuery = (fields, queryStr) => ({
    bool: {
      should: _.compact([
        // Exact phrase boost
        {
          multi_match: {
            query: queryStr,
            fields,
            type: "phrase",
            boost: 3,
          },
        },
        // Cross-field fuzzy
        {
          multi_match: {
            query: queryStr,
            fields,
            type: "best_fields",
            fuzziness: "AUTO",
            prefix_length: 1,
            boost: 1,
          },
        },
        // Prefix for autocomplete
        {
          multi_match: {
            query: queryStr,
            fields,
            type: "phrase_prefix",
            boost: 2,
          },
        },
      ]),
      minimum_should_match: 1,
    },
  });

  const searches = [
    // ── Categories ──────────────────────────────────────────────────
    { index: INDEX.category },
    {
      size,
      query: {
        bool: {
          must: buildTextQuery(["name^3", "description"], query),
          filter: [{ term: { isActive: true } }],
        },
      },
      ...(suggest && {
        suggest: {
          text: query,
          name_suggest: {
            term: {
              field: "name",
              suggest_mode: "missing",
              min_word_length: 3,
            },
          },
        },
      }),
    },

    // ── SubCategories ────────────────────────────────────────────────
    { index: INDEX.subCategory },
    {
      size,
      query: {
        bool: {
          must: buildTextQuery(
            ["name^3", "description", "categoryName^2"],
            query,
          ),
          filter: [{ term: { isActive: true } }],
        },
      },
    },

    // ── Products ─────────────────────────────────────────────────────
    { index: INDEX.product },
    {
      size,
      query: {
        bool: {
          must: buildTextQuery(
            [
              "name^4",
              "brand^3",
              "tags^2",
              "shortDescription^2",
              "description",
              "categoryName",
              "subCategoryName",
            ],
            query,
          ),
          filter: [
            { term: { isActive: true } },
            { term: { isDeleted: false } },
          ],
        },
      },
      sort: [
        { _score: "desc" },
        { isFeatured: "desc" },
        { ratingsAverage: "desc" },
      ],
    },
  ];

  const msearchBody = searches.flatMap((s) => [s]);

  const { responses } = await esClient.msearch({ searches: msearchBody });

  // ── Extract hits ─────────────────────────────────────────────────
  const [catResp, subResp, prodResp] = responses;

  const pick = (resp) =>
    (resp?.hits?.hits || []).map((h) => ({ ...h._source, _score: h._score }));

  const categories = pick(catResp);
  const subCategories = pick(subResp);
  const products = pick(prodResp);

  // ── Did-you-mean suggestion ──────────────────────────────────────
  let suggestion = null;
  if (suggest && catResp?.suggest?.name_suggest?.[0]?.options?.length > 0) {
    suggestion = catResp.suggest.name_suggest[0].options[0].text;
  }

  const result = {
    categories,
    subCategories,
    products,
    total: categories.length + subCategories.length + products.length,
    suggestion,
    query,
  };

  // ── Cache for 60 seconds ─────────────────────────────────────────
  try {
    await redis.set(cacheKey, JSON.stringify(result), "EX", 60);
  } catch (_) {}

  return result;
}

/**
 * Autocomplete suggestions — fast, prefix-only, returns names only.
 * Used for live dropdown typing (debounced).
 *
 * @param {string} prefix  – Partial query string
 * @returns {string[]}     – Suggestion strings
 */
export async function autocomplete(prefix) {
  if (!prefix?.trim() || prefix.trim().length < 2) return [];

  // ── Fallback to MongoDB when ES is not available ──────────────────
  if (!_esAvailable) {
    const regex = new RegExp(`^${_.escapeRegExp(prefix.trim())}`, "i");
    const [cats, subs, prods] = await Promise.all([
      Category.find({ isActive: true, name: regex })
        .select("name")
        .limit(3)
        .lean(),
      SubCategory.find({ isActive: true, name: regex })
        .select("name")
        .limit(3)
        .lean(),
      Product.find({ isActive: true, isDeleted: false, name: regex })
        .select("name")
        .limit(3)
        .lean(),
    ]);
    return _.uniq(
      [...cats, ...subs, ...prods].map((d) => d.name).filter(Boolean),
    ).slice(0, 8);
  }

  const cacheKey = `ac:${prefix.toLowerCase()}`;
  try {
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch (_) {}

  const prefixQuery = (index, field) => ({
    index,
    query: {
      bool: {
        must: [
          {
            match_phrase_prefix: {
              [field]: { query: prefix, max_expansions: 20 },
            },
          },
        ],
        filter: [{ term: { isActive: true } }],
      },
    },
    size: 3,
    _source: [field, "slug", "type"],
  });

  const searches = [
    { index: INDEX.category },
    prefixQuery(INDEX.category, "name"),
    { index: INDEX.subCategory },
    prefixQuery(INDEX.subCategory, "name"),
    { index: INDEX.product },
    prefixQuery(INDEX.product, "name"),
  ].flatMap((s) => [s]);

  const { responses } = await esClient.msearch({ searches });

  const suggestions = _.uniq(
    responses
      .flatMap((r) => r?.hits?.hits || [])
      .map((h) => h._source?.name)
      .filter(Boolean),
  ).slice(0, 8);

  try {
    await redis.set(cacheKey, JSON.stringify(suggestions), "EX", 120);
  } catch (_) {}

  return suggestions;
}

/**
 * Invalidate all search caches (call after bulk update)
 */
export async function invalidateSearchCache() {
  try {
    const keys = await redis.keys("search:*");
    const acKeys = await redis.keys("ac:*");
    const all = [...keys, ...acKeys];
    if (all.length) await redis.del(...all);
  } catch (_) {}
}
