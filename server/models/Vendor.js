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
      website: String,
      yearEstablished: Number,
      numberOfEmployees: Number,
      categories: [String],
      retailChannel: String,
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
  },
  { timestamps: true },
);

export default model("Vendor", vendorSchema);
