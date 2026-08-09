/**
 * razorpayController.js
 *
 * Two endpoints:
 *   POST /api/payments/razorpay/create-order  → create a Razorpay order (returns key + order_id)
 *   POST /api/payments/razorpay/verify        → verify HMAC signature then create DB order
 *
 * npm i razorpay
 * .env:  RAZORPAY_KEY_ID=rzp_live_xxx   RAZORPAY_KEY_SECRET=xxx
 */

import Razorpay from "razorpay";
import crypto from "crypto";
import Order from "../models/Order.js"; // ← your existing Order model

// ── Razorpay instance (shared singleton) ────────────────────────────────────
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ─── POST /api/payments/razorpay/create-order ────────────────────────────────
/**
 * Body: { amount: Number (INR, not paise), currency?: "INR", receipt?: string }
 * Returns: { orderId, amount, currency, keyId }
 */
export async function createRazorpayOrder(req, res) {
  try {
    const { amount, currency = "INR", receipt } = req.body;

    if (!amount || amount <= 0)
      return res.status(400).json({ message: "Invalid amount" });

    const options = {
      amount: Math.round(amount * 100), // Razorpay expects paise
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      payment_capture: 1, // auto-capture
    };

    const order = await razorpay.orders.create(options);

    return res.json({
      orderId: order.id, // "order_xxx" — send to frontend checkout
      amount: order.amount, // paise
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID, // public key is safe to expose
    });
  } catch (err) {
    console.error("[Razorpay] create-order error:", err);
    return res
      .status(500)
      .json({ message: err.message || "Payment initiation failed" });
  }
}

// ─── POST /api/payments/razorpay/verify ──────────────────────────────────────
/**
 * Body:
 *   razorpay_order_id   — from Razorpay
 *   razorpay_payment_id — from Razorpay handler
 *   razorpay_signature  — from Razorpay handler
 *   orderData           — your full order payload (items, address, etc.)
 *
 * Verifies HMAC-SHA256 signature, then creates the DB order.
 * Returns: { success, orderId }
 */
export async function verifyRazorpayPayment(req, res) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderData,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature)
      return res.status(400).json({ message: "Missing Razorpay fields" });

    // ── Signature verification ────────────────────────────────────────────────
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expected !== razorpay_signature)
      return res
        .status(400)
        .json({ message: "Payment verification failed — invalid signature" });

    // ── Create the DB order ───────────────────────────────────────────────────
    const order = await Order.create({
      ...orderData,
      user: req.user?._id,
      paymentMethod: "razorpay",
      paymentStatus: "paid",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      isPaid: true,
      paidAt: new Date(),
      status: "confirmed",
    });

    return res.status(201).json({
      success: true,
      orderId: order._id,
      message: "Payment verified and order placed",
    });
  } catch (err) {
    console.error("[Razorpay] verify error:", err);
    return res
      .status(500)
      .json({ message: err.message || "Order creation failed after payment" });
  }
}
