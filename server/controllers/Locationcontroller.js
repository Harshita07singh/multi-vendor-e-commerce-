import Location from "../models/Location.js";
import axios from "axios";

// ─── GET all locations ───────────────────────────────────────────────────────
export const getLocations = async (req, res) => {
  try {
    const locations = await Location.find({ user: req.user._id }).sort({
      isDefault: -1,
      createdAt: -1,
    });
    res.json({ success: true, data: locations });
  } catch (err) {
    console.error("[getLocations]", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ADD a new location ──────────────────────────────────────────────────────
export const addLocation = async (req, res) => {
  try {
    console.log("[addLocation] body:", JSON.stringify(req.body, null, 2));

    const {
      label = "other",
      customLabel = "",
      address,
      city = "",
      state = "",
      pincode = "",
      country = "India",
      coordinates,
      isDefault = false,
    } = req.body;

    // ── Validate required fields ──
    if (!address || !address.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Address is required" });
    }

    if (
      !coordinates ||
      coordinates.lat === undefined ||
      coordinates.lng === undefined
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Coordinates (lat & lng) are required",
        });
    }

    // ── Coerce to Number (form inputs send strings) ──
    const lat = parseFloat(coordinates.lat);
    const lng = parseFloat(coordinates.lng);

    if (isNaN(lat) || isNaN(lng)) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Invalid coordinates — lat and lng must be valid numbers",
        });
    }

    // ── First location is always default ──
    const count = await Location.countDocuments({ user: req.user._id });
    const shouldBeDefault = isDefault || count === 0;

    if (shouldBeDefault) {
      await Location.updateMany({ user: req.user._id }, { isDefault: false });
    }

    const location = await Location.create({
      user: req.user._id,
      label,
      customLabel,
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      country: country.trim(),
      coordinates: { lat, lng },
      isDefault: shouldBeDefault,
    });

    console.log("[addLocation] saved:", location._id);
    res.status(201).json({ success: true, data: location });
  } catch (err) {
    console.error("[addLocation] error:", err.message);
    if (err.errors) {
      console.error(
        "[addLocation] validation:",
        Object.values(err.errors).map((e) => e.message),
      );
    }
    res.status(500).json({
      success: false,
      message: err.message,
      details: err.errors
        ? Object.values(err.errors).map((e) => e.message)
        : undefined,
    });
  }
};

// ─── UPDATE a location ───────────────────────────────────────────────────────
export const updateLocation = async (req, res) => {
  try {
    const location = await Location.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!location)
      return res
        .status(404)
        .json({ success: false, message: "Location not found" });

    const {
      label,
      customLabel,
      address,
      city,
      state,
      pincode,
      country,
      coordinates,
      isDefault,
    } = req.body;

    if (isDefault) {
      await Location.updateMany(
        { user: req.user._id, _id: { $ne: location._id } },
        { isDefault: false },
      );
    }

    if (label !== undefined) location.label = label;
    if (customLabel !== undefined) location.customLabel = customLabel;
    if (address !== undefined) location.address = address.trim();
    if (city !== undefined) location.city = city.trim();
    if (state !== undefined) location.state = state.trim();
    if (pincode !== undefined) location.pincode = pincode.trim();
    if (country !== undefined) location.country = country.trim();
    if (isDefault !== undefined) location.isDefault = isDefault;

    if (coordinates) {
      const lat = parseFloat(coordinates.lat);
      const lng = parseFloat(coordinates.lng);
      if (!isNaN(lat) && !isNaN(lng)) location.coordinates = { lat, lng };
    }

    await location.save();
    res.json({ success: true, data: location });
  } catch (err) {
    console.error("[updateLocation]", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── DELETE a location ───────────────────────────────────────────────────────
export const deleteLocation = async (req, res) => {
  try {
    const location = await Location.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!location)
      return res
        .status(404)
        .json({ success: false, message: "Location not found" });

    if (location.isDefault) {
      const next = await Location.findOne({ user: req.user._id }).sort({
        createdAt: -1,
      });
      if (next) {
        next.isDefault = true;
        await next.save();
      }
    }

    res.json({ success: true, message: "Location deleted" });
  } catch (err) {
    console.error("[deleteLocation]", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── SET DEFAULT ─────────────────────────────────────────────────────────────
export const setDefaultLocation = async (req, res) => {
  try {
    await Location.updateMany({ user: req.user._id }, { isDefault: false });
    const location = await Location.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isDefault: true },
      { new: true },
    );
    if (!location)
      return res
        .status(404)
        .json({ success: false, message: "Location not found" });
    res.json({ success: true, data: location });
  } catch (err) {
    console.error("[setDefaultLocation]", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── REVERSE GEOCODE ─────────────────────────────────────────────────────────
export const reverseGeocode = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng)
      return res
        .status(400)
        .json({ success: false, message: "lat and lng are required" });

    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;

    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": "MyShoppingApp/1.0",
        Accept: "application/json",
        "Accept-Language": "en-US,en;q=0.9",
      },
      timeout: 10000,
    });

    if (!data || data.error)
      return res
        .status(404)
        .json({ success: false, message: "Location not found" });

    const addr = data.address || {};
    const shortParts = [
      addr.house_number,
      addr.road,
      addr.suburb || addr.neighbourhood,
    ].filter(Boolean);
    const shortAddress =
      shortParts.length > 0
        ? shortParts.join(", ")
        : data.display_name?.split(",").slice(0, 3).join(",").trim();

    res.json({
      success: true,
      data: {
        address: shortAddress || data.display_name,
        fullAddress: data.display_name,
        city: addr.city || addr.town || addr.village || addr.county || "",
        state: addr.state || addr.province || "",
        pincode: addr.postcode || "",
        country: addr.country || "",
      },
    });
  } catch (err) {
    console.error("[reverseGeocode]", err.code, err.message);
    if (err.code === "ECONNABORTED" || err.code === "ETIMEDOUT")
      return res
        .status(504)
        .json({
          success: false,
          message: "Timed out. Please enter address manually.",
        });
    if (err.code === "ENOTFOUND" || err.code === "EAI_AGAIN")
      return res
        .status(503)
        .json({
          success: false,
          message: "Server cannot reach geocoding service.",
        });
    if (err.response?.status === 429)
      return res
        .status(429)
        .json({ success: false, message: "Too many requests. Please wait." });
    res
      .status(500)
      .json({
        success: false,
        message: "Could not fetch address. Please enter manually.",
      });
  }
};
