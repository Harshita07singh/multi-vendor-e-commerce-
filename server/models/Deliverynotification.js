import mongoose from "mongoose";

const deliveryNotificationSchema = new mongoose.Schema(
  {
    deliveryPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    type: {
      type: String,
      enum: ["new_order", "order_update", "system"],
      default: "new_order",
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    isRead: { type: Boolean, default: false },

    // FIX: must have `default: null` — without it Mongoose stores the field
    // as `undefined`, and MongoDB's { isAccepted: null } query won't match it.
    isAccepted: { type: Boolean, default: null },

    acceptedAt: { type: Date, default: null },
    declinedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// Fast look-up: "give me all pending notifications for partner X"
deliveryNotificationSchema.index({
  deliveryPartner: 1,
  isAccepted: 1,
  createdAt: -1,
});
// Fast fan-out: "decline everyone else on order Y"
deliveryNotificationSchema.index({ order: 1, isAccepted: 1 });

export default mongoose.model(
  "DeliveryNotification",
  deliveryNotificationSchema,
);
