import { Schema, model } from "mongoose";

const vendorSchema = new Schema(
  {
    //  Auth
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    //  Business Details
    businessDetails: {
      businessName: String,
      businessType: String,
      gstNumber: String,
      panNumber: String,
      businessEmail: String,
      businessPhone: String,
      yearEstablished: Number,
      numberOfEmployees: Number,
      categories: [String],
      retailChannel: String,

      // ── Onboarding type ──────────────────────────────────────────
      // Vendor can be a retailer, wholesaler, or both.
      // Stored as an array so both can be selected simultaneously.
      // e.g. ["retailer"] | ["wholesaler"] | ["retailer","wholesaler"]
      onboardingType: {
        type: [
          {
            type: String,
            enum: ["retailer", "wholesaler"],
          },
        ],
        default: [],
      },
    },

    //  Seller Details
    sellerDetails: {
      sellerName: String,
      sellerEmail: String,
      sellerPhone: String,
      address: String,
      city: String,
      state: String,
      pincode: String,
    },

    //  Brand Details
    brandDetails: {
      brandName: String,
      brandType: String,
      trademarkNumber: String,
      brandWebsite: String,
      brandLogo: String,
    },

    //  Bank Details
    bankDetails: {
      accountHolderName: String,
      accountNumber: String,
      ifscCode: String,
      bankName: String,
      branch: String,
    },

    //  Shipping
    shippingLocations: {
      warehouseAddress: String,
      city: String,
      state: String,
      pincode: String,
      latitude: Number,
      longitude: Number,
    },

    //  Digital Signature
    digitalSignature: {
      signed: {
        type: Boolean,
        default: false,
      },
      signatureDate: Date,
    },

    // Approval System
    status: {
      type: String,
      enum: ["draft", "pending", "approved", "rejected"],
      default: "draft",
    },

    adminRemark: {
      type: String,
    },

    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    subscription: {
      plan: {
        type: String,
        enum: ["free", "pro", "premium"],
        default: "free",
      },
      billing: {
        type: String,
        enum: ["monthly", "yearly", null],
        default: null,
      },
      expiresAt: {
        type: Date,
        default: null,
      },
      razorpayOrderId: { type: String, default: null },
      razorpayPaymentId: { type: String, default: null },
      razorpaySignature: { type: String, default: null },
      activatedAt: { type: Date, default: null },
    },
  },
  { timestamps: true },
);

export default model("Vendor", vendorSchema);
