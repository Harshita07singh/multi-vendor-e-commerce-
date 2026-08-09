import Banner from "../models/banner.model.js";
import {
  parsePagination,
  createPaginatedResponse,
} from "../utils/paginationHelper.js";

// CREATE — Admin only
export async function createBanner(req, res) {
  try {
    const { title, startDate, endDate, linkType, linkValue, linkLabel } =
      req.body;

    if (!title?.trim())
      return res.status(400).json({ message: "Title is required" });
    if (!startDate || !endDate)
      return res
        .status(400)
        .json({ message: "Start and end dates are required" });
    if (new Date(startDate) >= new Date(endDate))
      return res
        .status(400)
        .json({ message: "End date must be after start date" });
    if (!linkType)
      return res.status(400).json({ message: "Link type is required" });

    let image;
    if (req.file) image = `/uploads/${req.file.filename}`;
    else if (req.body.image) image = req.body.image;
    else return res.status(400).json({ message: "Banner image is required" });

    const banner = await Banner.create({
      title,
      image,
      startDate,
      endDate,
      linkType,
      linkValue: linkValue || "",
      linkLabel: linkLabel || "",
      createdBy: req.user.id,
    });

    res.status(201).json(banner);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// GET ALL — public (only active & date-valid ones) - With pagination
export async function getBanners(req, res) {
  try {
    const { all, page = 1, limit = 10 } = req.query; // admin passes ?all=true
    const paginationParams = parsePagination({ page, limit }, 10, 50);
    const now = new Date();

    const query =
      all === "true"
        ? {}
        : { isActive: true, startDate: { $lte: now }, endDate: { $gte: now } };

    const [banners, total] = await Promise.all([
      Banner.find(query)
        .skip(paginationParams.skip)
        .limit(paginationParams.limit)
        .sort({ createdAt: -1 }),
      Banner.countDocuments(query),
    ]);
    res.json(
      createPaginatedResponse(
        banners,
        total,
        paginationParams.page,
        paginationParams.limit,
      ),
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// GET SINGLE
export async function getBanner(req, res) {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });
    res.json(banner);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// UPDATE — Admin only
export async function updateBanner(req, res) {
  try {
    const existing = await Banner.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Banner not found" });

    const updateData = { ...req.body };

    if (req.file) updateData.image = `/uploads/${req.file.filename}`;
    else if (!req.body.image) delete updateData.image; // keep existing

    if (updateData.startDate && updateData.endDate) {
      if (new Date(updateData.startDate) >= new Date(updateData.endDate))
        return res
          .status(400)
          .json({ message: "End date must be after start date" });
    }

    const banner = await Banner.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });
    res.json(banner);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// DELETE — Admin only
export async function deleteBanner(req, res) {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });

    await Banner.findByIdAndDelete(req.params.id);
    res.json({ message: "Banner deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// TOGGLE active — Admin only
export async function toggleBanner(req, res) {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });

    banner.isActive = !banner.isActive;
    await banner.save();
    res.json(banner);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
