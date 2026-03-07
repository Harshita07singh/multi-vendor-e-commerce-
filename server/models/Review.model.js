import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    title: {
      type: String,
      trim: true,
      maxlength: [120, "Title cannot exceed 120 characters"],
    },
    body: {
      type: String,
      trim: true,
      maxlength: [2000, "Review body cannot exceed 2000 characters"],
    },
    images: [
      {
        url: { type: String },
      },
    ],
    verifiedPurchase: {
      type: Boolean,
      default: false,
    },
    helpful: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isVisible: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// One review per user per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Virtual: helpful count
reviewSchema.virtual("helpfulCount").get(function () {
  return this.helpful?.length || 0;
});

// ── Helper: recalculate and sync ratings on the parent Product ──
async function syncProductRatings(productId) {
  const stats = await mongoose.model("Review").aggregate([
    {
      $match: {
        product: new mongoose.Types.ObjectId(productId),
        isVisible: true,
      },
    },
    {
      $group: {
        _id: "$product",
        ratingsAverage: { $avg: "$rating" },
        ratingsCount: { $sum: 1 },
      },
    },
  ]);

  const update =
    stats.length > 0
      ? {
          ratingsAverage: Math.round(stats[0].ratingsAverage * 10) / 10,
          ratingsCount: stats[0].ratingsCount,
        }
      : { ratingsAverage: 0, ratingsCount: 0 };

  await mongoose.model("Product").findByIdAndUpdate(productId, update);
}

// Sync after create / update
reviewSchema.post("save", async function () {
  await syncProductRatings(this.product);
});

// Sync after delete
reviewSchema.post("findOneAndDelete", async function (doc) {
  if (doc) await syncProductRatings(doc.product);
});

const Review = mongoose.model("Review", reviewSchema);
export default Review;
