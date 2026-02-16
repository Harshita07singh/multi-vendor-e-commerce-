import express from "express";
import {
  createAdmin,
  getAdmins,
  updateAdmin,
  deleteAdmin,
} from "../controllers/AdminController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
const router = express.Router();
router.post(
  "/create-admin",
  protect,
  authorizeRoles("superadmin"),
  createAdmin,
);

router.get("/admins", protect, authorizeRoles("superadmin"), getAdmins);

router.put("/admin/:id", protect, authorizeRoles("superadmin"), updateAdmin);

router.delete("/admin/:id", protect, authorizeRoles("superadmin"), deleteAdmin);

export default router;
