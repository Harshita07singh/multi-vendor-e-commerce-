// routes/deliveryDashboardRoutes.js
import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import {
  getDeliveryProfile,
  updateDeliveryProfile,
  toggleOnlineStatus,
  updateDeliveryLocation,
  getDeliveryStats,
  getDeliveryOrders,
  getActiveDeliveryOrder,
  markOrderPickedUp,
  markOrderDelivered,
  getDeliveryNotifications,
  acceptDeliveryNotification,
  declineDeliveryNotification,
  markAllNotificationsRead,
} from "../controllers/Deliverydashboardcontroller.js";

const router = express.Router();

// All routes require auth + delivery role
router.use(protect);
router.use(authorizeRoles("delivery", "admin", "superAdmin"));

// Profile
router.get("/me", getDeliveryProfile);
router.put("/me", updateDeliveryProfile);

// Online status & location
router.patch("/toggle-online", toggleOnlineStatus);
router.patch("/location", updateDeliveryLocation);

// Stats
router.get("/stats", getDeliveryStats);

// Orders
router.get("/orders", getDeliveryOrders);
router.get("/orders/active", getActiveDeliveryOrder);
router.patch("/orders/:id/picked", markOrderPickedUp);
router.patch("/orders/:id/delivered", markOrderDelivered);

// Notifications
router.get("/notifications", getDeliveryNotifications);
router.post("/notifications/:id/accept", acceptDeliveryNotification);
router.post("/notifications/:id/decline", declineDeliveryNotification);
router.patch("/notifications/read-all", markAllNotificationsRead);

export default router;
