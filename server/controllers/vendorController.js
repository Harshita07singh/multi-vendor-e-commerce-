import Vendor from "../models/Vendor.js";
import User from "../models/User.js";

//  Get all vendors (Admin)
export const getAllVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find()
      .populate("userId", "name email phone")
      .sort({ createdAt: -1 });

    res.status(200).json(vendors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single vendor details
export const getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id).populate(
      "userId",
      "name email phone",
    );

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.status(200).json(vendor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get vendor by current user
export const getMyVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user.id });

    if (!vendor) {
      return res.status(404).json({ message: "Vendor profile not found" });
    }

    res.status(200).json(vendor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Save vendor step
export async function saveVendorStep(req, res) {
  try {
    const { step, data } = req.body;
    const userId = req.user.id;

    // Validate step and data
    if (!step || !data) {
      return res.status(400).json({
        success: false,
        message: "Step and data are required",
      });
    }

    let vendor = await Vendor.findOne({ userId });

    if (!vendor) {
      vendor = new Vendor({ userId });
    }

    // Update the specific step
    vendor[step] = data;

    await vendor.save();

    res.status(200).json({
      success: true,
      message: "Step saved successfully",
      vendor,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// Submit vendor for approval
export const submitVendor = async (req, res) => {
  try {
    const userId = req.user.id;

    const vendor = await Vendor.findOne({ userId });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor profile not found",
      });
    }

    // Check if vendor has all required information
    if (
      !vendor.businessDetails?.businessName ||
      !vendor.sellerDetails?.sellerName
    ) {
      return res.status(400).json({
        success: false,
        message: "Please complete all required steps before submitting",
      });
    }

    vendor.status = "pending";
    await vendor.save();

    res.json({
      success: true,
      message: "Application submitted for admin approval",
      vendor,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update vendor status by admin
export const updateVendorStatus = async (req, res) => {
  try {
    const { vendorId, status, remark } = req.body;

    // Validate status
    const validStatuses = ["approved", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'approved' or 'rejected'",
      });
    }

    const vendor = await Vendor.findById(vendorId);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    vendor.status = status;
    vendor.adminRemark = remark || "";
    vendor.approvedBy = req.user.id;

    await vendor.save();

    res.json({
      success: true,
      message: `Vendor ${status.charAt(0).toUpperCase() + status.slice(1)} successfully`,
      vendor,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
