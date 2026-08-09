/**
 * Pagination Helper Utility
 * Standardized pagination for all list endpoints
 */

/**
 * Parse pagination parameters from query
 * @param {Object} query - Express req.query object
 * @param {number} defaultLimit - Default items per page (default: 10)
 * @param {number} maxLimit - Maximum items per page (default: 100)
 * @returns {Object} { page, limit, skip }
 */
export function parsePagination(query, defaultLimit = 10, maxLimit = 100) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.max(
    1,
    Math.min(maxLimit, parseInt(query.limit) || defaultLimit),
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/**
 * Create standardized pagination response
 * @param {Array} data - Array of items
 * @param {number} total - Total count of items
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {Object} extra - Extra fields to include in response
 * @returns {Object} Standardized pagination response
 */
export function createPaginatedResponse(data, total, page, limit, extra = {}) {
  const pages = Math.ceil(total / limit);

  return {
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      pages,
      hasNextPage: page < pages,
      hasPrevPage: page > 1,
    },
    ...extra,
  };
}

/**
 * Error handler for pagination queries
 * @param {Error} error - The error object
 * @returns {Object} Error response
 */
export function handlePaginationError(error, statusCode = 500) {
  return {
    success: false,
    message: error.message || "An error occurred while fetching data",
    error: process.env.NODE_ENV === "development" ? error.message : undefined,
  };
}
