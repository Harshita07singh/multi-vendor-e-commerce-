// socket/socketManager.js
//
// A tiny singleton that holds the Socket.IO `io` instance so any module
// (controllers, cron jobs, etc.) can emit events without circular imports.
//
// Usage
//   import { setIO, getIO } from "../socket/socketManager.js";
//
//   // In server.js (once, after httpServer is created):
//   setIO(io);
//
//   // Anywhere else:
//   getIO().to(`delivery:${userId}`).emit("new_order", payload);

let _io = null;

/**
 * Store the Socket.IO server instance.
 * Call this once in server.js right after `new Server(httpServer, …)`.
 * @param {import("socket.io").Server} io
 */
export function setIO(io) {
  _io = io;
}

/**
 * Retrieve the Socket.IO server instance.
 * Throws if called before setIO() (fast-fail instead of silent null bugs).
 * @returns {import("socket.io").Server}
 */
export function getIO() {
  if (!_io) {
    throw new Error(
      "[socketManager] io is not initialised yet. Call setIO(io) in server.js first.",
    );
  }
  return _io;
}
