import User from "../models/User.js";

//create admin
export const createAdmin = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({
        message: "Admin already exists",
      });
    }

    const admin = await User.create({
      name,
      email,
      password,
      phone,
      role: "admin",
      status: "active",
      isApproved: true,
    });

    res.status(201).json({
      message: "Admin created successfully",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get all admins with pagination and search
export const getAdmins = async (req, res) => {
  try {
    const { page = 1, limit = 5, search = "" } = req.query;

    const query = {
      role: "admin",
      name: { $regex: search, $options: "i" },
    };

    const admins = await User.find(query)
      .select("-password")
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    res.json({
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      admins,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Update admin details
export const updateAdmin = async (req, res) => {
  try {
    const { name, phone } = req.body;

    const admin = await User.findById(req.params.id);

    if (!admin || admin.role !== "admin") {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (name !== undefined) admin.name = name;
    if (phone !== undefined) admin.phone = phone;

    await admin.save();

    res.json({ message: "Admin updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete admin
export const deleteAdmin = async (req, res) => {
  try {
    const admin = await User.findById(req.params.id);

    if (!admin || admin.role !== "admin") {
      return res.status(404).json({ message: "Admin not found" });
    }

    await admin.deleteOne();

    res.json({ message: "Admin deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get pending deliveries
export const getPendingDeliveries = async (req, res) => {
  try {
    const deliveries = await User.find({
      role: "delivery",
      isApproved: false,
    }).select("-password");

    res.json({
      total: deliveries.length,
      deliveries,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve delivery partner
export const approveDelivery = async (req, res) => {
  try {
    const { id } = req.params;

    const delivery = await User.findById(id);

    if (!delivery || delivery.role !== "delivery") {
      return res.status(404).json({ message: "Delivery partner not found" });
    }

    delivery.isApproved = true;
    delivery.status = "active";
    await delivery.save();

    res.json({ message: "Delivery partner approved successfully", delivery });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reject delivery partner
export const rejectDelivery = async (req, res) => {
  try {
    const { id } = req.params;

    const delivery = await User.findById(id);

    if (!delivery || delivery.role !== "delivery") {
      return res.status(404).json({ message: "Delivery partner not found" });
    }

    await delivery.deleteOne();

    res.json({ message: "Delivery partner rejected successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
