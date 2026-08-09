import Contact from "../models/Contact.js";

// ─── PUBLIC ────────────────────────────────────────────────────────────────────

/**
 * POST /api/contact
 * Anyone can submit a contact query (no auth required)
 */
export const submitContactQuery = async (req, res) => {
  try {
    const { fullName, email, phone, subject, message } = req.body;

    if (!fullName || !email || !phone || !subject || !message) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const contact = await Contact.create({
      fullName,
      email,
      phone,
      subject,
      message,
    });

    return res.status(201).json({
      success: true,
      message: "Your query has been submitted. We'll get back to you soon!",
      data: contact,
    });
  } catch (error) {
    console.error("submitContactQuery error:", error);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
};

// ─── SUPER-ADMIN ────────────────────────────────────────────────────────────────

/**
 * GET /api/contact
 * SuperAdmin: fetch all contact queries with optional status filter & pagination
 * Query params: status, page, limit
 */
export const getAllContactQueries = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status && status !== "all") filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [contacts, total] = await Promise.all([
      Contact.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Contact.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: contacts,
    });
  } catch (error) {
    console.error("getAllContactQueries error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

/**
 * GET /api/contact/:id
 * SuperAdmin: get single query detail
 */
export const getContactQueryById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: "Query not found." });
    }
    return res.status(200).json({ success: true, data: contact });
  } catch (error) {
    console.error("getContactQueryById error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

/**
 * PATCH /api/contact/:id
 * SuperAdmin: update status and/or add admin note
 * Body: { status, adminNote }
 */
export const updateContactQuery = async (req, res) => {
  try {
    const { status, adminNote } = req.body;

    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: "Query not found." });
    }

    if (status) contact.status = status;
    if (adminNote !== undefined) contact.adminNote = adminNote;
    if (status === "resolved" && !contact.resolvedAt) {
      contact.resolvedAt = new Date();
    }

    await contact.save();

    return res.status(200).json({
      success: true,
      message: "Query updated successfully.",
      data: contact,
    });
  } catch (error) {
    console.error("updateContactQuery error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

/**
 * DELETE /api/contact/:id
 * SuperAdmin: delete a query
 */
export const deleteContactQuery = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: "Query not found." });
    }
    return res.status(200).json({ success: true, message: "Query deleted." });
  } catch (error) {
    console.error("deleteContactQuery error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

/**
 * GET /api/contact/stats
 * SuperAdmin: count by status for dashboard badges
 */
export const getContactStats = async (req, res) => {
  try {
    const stats = await Contact.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const formatted = {
      pending: 0,
      "in-progress": 0,
      resolved: 0,
      closed: 0,
      total: 0,
    };
    stats.forEach(({ _id, count }) => {
      formatted[_id] = count;
      formatted.total += count;
    });

    return res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    console.error("getContactStats error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};
