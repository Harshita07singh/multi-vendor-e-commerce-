import Review from "../models/Review.model.js";

export const getReviews = async (req, res) => {
  try {
    const { page = 1, limit = 8, sort = "newest", rating } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter = {
      product: req.params.productId,
      isVisible: true,
    };
    if (rating) filter.rating = Number(rating);

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      highest: { rating: -1 },
      lowest: { rating: 1 },
      helpful: { helpfulCount: -1 },
    };

    const [reviews, total, breakdown] = await Promise.all([
      Review.find(filter)
        .populate("user", "name avatar")
        .sort(sortMap[sort] ?? sortMap.newest)
        .skip(skip)
        .limit(Number(limit))
        .lean(),

      Review.countDocuments(filter),

      Review.aggregate([
        {
          $match: {
            product: new (await import("mongoose")).default.Types.ObjectId(
              req.params.productId,
            ),
            isVisible: true,
          },
        },
        { $group: { _id: "$rating", count: { $sum: 1 } } },
      ]),
    ]);

    // Shape breakdown → { 1: n, 2: n, 3: n, 4: n, 5: n }
    const ratingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    breakdown.forEach(({ _id, count }) => {
      ratingBreakdown[_id] = count;
    });

    // Enrich reviews with helpfulCount and whether the caller marked helpful
    const callerId = req.user?._id?.toString();
    const enriched = reviews.map((r) => ({
      ...r,
      helpfulCount: r.helpful?.length || 0,
      markedHelpful: callerId
        ? (r.helpful ?? []).some((id) => id.toString() === callerId)
        : false,
    }));

    res.status(200).json({
      success: true,
      reviews: enriched,
      total,
      pages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      breakdown: ratingBreakdown,
    });
  } catch (error) {
    console.error("getReviews error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Create a review
// @route   POST /api/reviews/:productId
// @access  Private
// ─────────────────────────────────────────────────────────────
export const createReview = async (req, res) => {
  try {
    const { rating, title, body, images } = req.body;

    if (!rating) {
      return res
        .status(400)
        .json({ success: false, message: "Rating is required" });
    }

    // ── Optional: check for verified purchase ──────────────────
    // Uncomment if you have an Order model
    // let verifiedPurchase = false;
    // try {
    //   const order = await Order.findOne({
    //     user: req.user._id,
    //     "items.product": req.params.productId,
    //     status: "delivered",
    //   });
    //   verifiedPurchase = !!order;
    // } catch (_) {}

    const review = await Review.create({
      product: req.params.productId,
      user: req.user._id,
      rating,
      title,
      body,
      images: images ?? [],
      // verifiedPurchase,   // uncomment when Order model is wired
    });

    await review.populate("user", "name avatar");

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      review,
    });
  } catch (error) {
    // Duplicate key → user already reviewed this product
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this product.",
      });
    }
    console.error("createReview error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Update own review
// @route   PATCH /api/reviews/:reviewId
// @access  Private
// ─────────────────────────────────────────────────────────────
export const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorised to edit this review",
      });
    }

    const { rating, title, body, images } = req.body;

    if (rating !== undefined) review.rating = rating;
    if (title !== undefined) review.title = title;
    if (body !== undefined) review.body = body;
    if (images !== undefined) review.images = images;

    await review.save();
    await review.populate("user", "name avatar");

    res.status(200).json({
      success: true,
      message: "Review updated",
      review,
    });
  } catch (error) {
    console.error("updateReview error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Delete a review (owner or admin)
// @route   DELETE /api/reviews/:reviewId
// @access  Private
// ─────────────────────────────────────────────────────────────
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    const isOwner = review.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorised to delete this review",
      });
    }

    await Review.findByIdAndDelete(req.params.reviewId);

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("deleteReview error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Toggle "helpful" on a review
// @route   POST /api/reviews/:reviewId/helpful
// @access  Private
// ─────────────────────────────────────────────────────────────
export const toggleHelpful = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    const uid = req.user._id.toString();
    const index = review.helpful.findIndex((id) => id.toString() === uid);

    if (index === -1) {
      review.helpful.push(req.user._id);
    } else {
      review.helpful.splice(index, 1);
    }

    await review.save();

    res.status(200).json({
      success: true,
      helpfulCount: review.helpful.length,
      marked: index === -1, // true = just added, false = just removed
    });
  } catch (error) {
    console.error("toggleHelpful error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Get a single review by ID
// @route   GET /api/reviews/single/:reviewId
// @access  Public
// ─────────────────────────────────────────────────────────────
export const getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId).populate(
      "user",
      "name avatar",
    );

    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    res.status(200).json({ success: true, review });
  } catch (error) {
    console.error("getReviewById error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
