import express from "express";
import {
  getLocations,
  addLocation,
  updateLocation,
  deleteLocation,
  setDefaultLocation,
  reverseGeocode,
} from "../controllers/Locationcontroller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ── PUBLIC — no login needed ─────────────────────────────────────
router.get("/reverse-geocode", reverseGeocode);

// ── PROTECTED — must be logged in ────────────────────────────────
router.use(protect);

router.get("/", getLocations);
router.post("/", addLocation);
router.put("/:id", updateLocation);
router.delete("/:id", deleteLocation);
router.patch("/:id/default", setDefaultLocation);

export default router;
