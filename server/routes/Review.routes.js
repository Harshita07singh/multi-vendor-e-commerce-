import express from "express";
import {
  getReviews,
  createReview,
  updateReview,
  deleteReview,
  toggleHelpful,
  getReviewById,
} from "../controllers/Review.controller.js";
import { protect } from "../middleware/authMiddleware.js"; // adjust path to your auth middleware

const router = express.Router();

// ── Public ────────────────────────────────────────────────────
// GET  /api/reviews/:productId          → paginated list with breakdown
// GET  /api/reviews/single/:reviewId    → single review
router.get("/single/:reviewId", getReviewById);
router.get("/:productId", getReviews);

// ── Protected (logged-in users) ───────────────────────────────
// POST   /api/reviews/:productId             → create review
// PATCH  /api/reviews/:reviewId              → edit own review
// DELETE /api/reviews/:reviewId              → delete own review (admin can delete any)
// POST   /api/reviews/:reviewId/helpful      → toggle helpful
router.post("/:productId", protect, createReview);
router.patch("/:reviewId", protect, updateReview);
router.delete("/:reviewId", protect, deleteReview);
router.post("/:reviewId/helpful", protect, toggleHelpful);

export default router;
