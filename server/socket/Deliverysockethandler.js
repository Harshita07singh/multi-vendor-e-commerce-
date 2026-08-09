// socket/deliverySocketHandler.js
//
// Registers all Socket.IO connection logic for delivery partners.
//
// Wire it up in server.js:
//   import { registerDeliverySocket } from "./socket/deliverySocketHandler.js";
//   registerDeliverySocket(io);

import jwt from "jsonwebtoken";
import User from "../models/User.js";
import DeliveryNotification from "../models/Deliverynotification.js";

// ─── In-memory map: notificationId → NodeJS.Timeout ─────────────────────────
// Keeps one auto-decline timer per pending notification.
// If a partner accepts/declines before expiry the timer is cleared.
const pendingTimers = new Map();

/**
 * Cancel an outstanding auto-decline timer (called on accept / manual decline).
 * @param {string} notifId  Mongo _id as string
 */
export function clearNotificationTimer(notifId) {
  const t = pendingTimers.get(notifId);
  if (t) {
    clearTimeout(t);
    pendingTimers.delete(notifId);
  }
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Schedule an auto-decline for a notification if the partner doesn't respond
 * within `timeoutMs` (default 30 s).  After expiry:
 *   1. Sets isAccepted = false in DB
 *   2. Emits `notification_expired` to the partner's room
 *
 * @param {string} notifId
 * @param {string} partnerId   Mongo _id as string
 * @param {import("socket.io").Server} io
 * @param {number} [timeoutMs=30000]
 */
export function scheduleNotificationExpiry(
  notifId,
  partnerId,
  io,
  timeoutMs = 30_000,
) {
  // Clear any previous timer for the same notification (idempotent)
  clearNotificationTimer(notifId);

  const timer = setTimeout(async () => {
    pendingTimers.delete(notifId);
    try {
      const updated = await DeliveryNotification.findOneAndUpdate(
        { _id: notifId, isAccepted: { $in: [null, undefined] } },
        { isAccepted: false, declinedAt: new Date() },
        { new: true },
      );

      if (updated) {
        // Tell the partner's UI to dismiss the notification card
        io.to(`delivery:${partnerId}`).emit("notification_expired", {
          notificationId: notifId,
        });
        console.log(
          `[Socket] Auto-declined notification ${notifId} for partner ${partnerId}`,
        );
      }
    } catch (err) {
      console.error("[scheduleNotificationExpiry] DB error:", err.message);
    }
  }, timeoutMs);

  pendingTimers.set(notifId, timer);
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Attach Socket.IO auth middleware + connection handler.
 * @param {import("socket.io").Server} io
 */
export function registerDeliverySocket(io) {
  // ── Auth middleware ──────────────────────────────────────────────────────
  // Runs before the connection event; rejects unauthenticated sockets early.
  io.use(async (socket, next) => {
    try {
      // Accept token from either handshake.auth.token or query string
      // so both mobile (header-less) and web clients work.
      const token =
        socket.handshake.auth?.token || socket.handshake.query?.token;

      if (!token) {
        return next(new Error("AUTH_MISSING: No token provided"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select(
        "_id role isApproved",
      );

      if (!user) return next(new Error("AUTH_INVALID: User not found"));
      if (!["delivery", "admin", "superAdmin"].includes(user.role)) {
        return next(new Error("AUTH_FORBIDDEN: Insufficient role"));
      }

      // Attach to socket so handlers can read it without another DB query
      socket.userId = user._id.toString();
      socket.userRole = user.role;
      next();
    } catch (err) {
      next(new Error(`AUTH_ERROR: ${err.message}`));
    }
  });

  // ── Connection handler ───────────────────────────────────────────────────
  io.on("connection", (socket) => {
    const partnerId = socket.userId;

    // Each delivery partner gets an isolated private room.
    // Emitting to `delivery:<id>` reaches ALL devices the partner is logged in on.
    socket.join(`delivery:${partnerId}`);
    console.log(
      `[Socket] Delivery partner ${partnerId} connected (${socket.id})`,
    );

    // ── Event: partner goes online / offline ────────────────────────────
    // Mirrors PATCH /toggle-online but over the socket so the server
    // can keep track without an extra REST call.
    socket.on("set_online_status", async ({ isOnline }) => {
      try {
        await User.findByIdAndUpdate(partnerId, {
          isOnline: !!isOnline,
          isAvailable: !!isOnline,
        });
        // Echo back so the client can confirm
        socket.emit("online_status_updated", { isOnline: !!isOnline });
      } catch (err) {
        socket.emit("error_event", { message: err.message });
      }
    });

    // ── Event: location update ──────────────────────────────────────────
    // Replaces the polling pattern of PATCH /location.
    // Clients should emit this every 10-30 s while online.
    // We debounce at the app layer: only write to DB if position changed
    // meaningfully (> ~50 m) to cut write load.
    let lastLat = null;
    let lastLng = null;

    socket.on("update_location", async ({ lat, lng }) => {
      const parsedLat = parseFloat(lat);
      const parsedLng = parseFloat(lng);

      if (isNaN(parsedLat) || isNaN(parsedLng)) {
        return socket.emit("error_event", { message: "Invalid lat/lng" });
      }

      // ~0.0005° ≈ 55 m — skip DB write for tiny jitter
      const significant =
        lastLat === null ||
        Math.abs(parsedLat - lastLat) > 0.0005 ||
        Math.abs(parsedLng - lastLng) > 0.0005;

      if (!significant) return; // No-op; don't even ack

      lastLat = parsedLat;
      lastLng = parsedLng;

      try {
        await User.findByIdAndUpdate(partnerId, {
          "currentLocation.lat": parsedLat,
          "currentLocation.lng": parsedLng,
          "currentLocation.updatedAt": new Date(),
        });
        socket.emit("location_updated", { lat: parsedLat, lng: parsedLng });
      } catch (err) {
        socket.emit("error_event", { message: err.message });
      }
    });

    // ── Event: client explicitly marks a notification read ──────────────
    socket.on("mark_notifications_read", async () => {
      try {
        await DeliveryNotification.updateMany(
          { deliveryPartner: partnerId, isRead: false },
          { isRead: true },
        );
        socket.emit("notifications_marked_read");
      } catch (err) {
        socket.emit("error_event", { message: err.message });
      }
    });

    // ── Disconnect ──────────────────────────────────────────────────────
    socket.on("disconnect", (reason) => {
      console.log(
        `[Socket] Delivery partner ${partnerId} disconnected (${socket.id}): ${reason}`,
      );
      // NOTE: We do NOT set isOnline = false here automatically because:
      //  - The partner may reconnect within seconds (network blip).
      //  - Use a TTL / heartbeat check job if you need auto-offline logic.
    });
  });
}
