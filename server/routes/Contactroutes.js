import express from "express";
import {
  submitContactQuery,
  getAllContactQueries,
  getContactQueryById,
  updateContactQuery,
  deleteContactQuery,
  getContactStats,
} from "../controllers/Contactcontroller.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// ─── PUBLIC ────────────────────────────────────────────────────────────────────
router.post("/", submitContactQuery);

// ─── SUPER-ADMIN ONLY ──────────────────────────────────────────────────────────
const superAdminOnly = [protect, authorizeRoles("superadmin")];

router.get("/stats", ...superAdminOnly, getContactStats);
router.get("/", ...superAdminOnly, getAllContactQueries);
router.get("/:id", ...superAdminOnly, getContactQueryById);
router.patch("/:id", ...superAdminOnly, updateContactQuery);
router.delete("/:id", ...superAdminOnly, deleteContactQuery);

export default router;
