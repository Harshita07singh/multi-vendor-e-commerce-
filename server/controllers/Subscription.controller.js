// controllers/subscription.controller.js
import Razorpay from "razorpay";
import crypto from "crypto";
import Vendor from "../models/Vendor.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const PLANS = {
  pro: {
    monthly: { amount: 49900, label: "Pro Monthly", days: 30 },
    yearly: { amount: 399900, label: "Pro Yearly", days: 365 },
  },
  premium: {
    monthly: { amount: 99900, label: "Premium Monthly", days: 30 },
    yearly: { amount: 799900, label: "Premium Yearly", days: 365 },
  },
};

function isActivePro(vendor) {
  const plan = vendor.subscription?.plan;
  if (!plan || plan === "free") return false;
  const exp = vendor.subscription?.expiresAt;
  if (!exp) return true;
  return new Date(exp) > new Date();
}

function addDays(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

// ── GET /api/subscription/my-plan ────────────────────────────────
export async function getMyPlan(req, res) {
  try {
    const vendor = await Vendor.findOne({ userId: req.user.id }).select(
      "subscription",
    );
    if (!vendor)
      return res.status(404).json({ message: "Vendor profile not found" });

    res.json({
      plan: vendor.subscription?.plan ?? "free",
      billing: vendor.subscription?.billing ?? null,
      expiresAt: vendor.subscription?.expiresAt ?? null,
      activatedAt: vendor.subscription?.activatedAt ?? null,
      isPro: isActivePro(vendor),
      subscription: vendor.subscription,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// ── POST /api/subscription/create-order ──────────────────────────
export async function createOrder(req, res) {
  try {
    const { plan, billing } = req.body;

    if (!PLANS[plan]?.[billing])
      return res.status(400).json({ message: "Invalid plan or billing cycle" });

    const { amount, label } = PLANS[plan][billing];

    // receipt max 40 chars
    const receipt = `sub_${Date.now()}`;

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt,
      notes: { userId: req.user.id, plan, billing },
    });

    await Vendor.findOneAndUpdate(
      { userId: req.user.id },
      { "subscription.razorpayOrderId": order.id },
    );

    res.json({
      orderId: order.id,
      amount,
      currency: "INR",
      label,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("createOrder error:", err);
    res.status(500).json({ message: err.error?.description || err.message });
  }
}

// ── POST /api/subscription/verify-payment ────────────────────────
export async function verifyPayment(req, res) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan,
      billing,
    } = req.body;

    const expectedSig = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSig !== razorpay_signature)
      return res.status(400).json({ message: "Payment verification failed" });

    if (!PLANS[plan]?.[billing])
      return res.status(400).json({ message: "Invalid plan or billing" });

    const { days } = PLANS[plan][billing];

    const vendor = await Vendor.findOneAndUpdate(
      { userId: req.user.id },
      {
        subscription: {
          plan,
          billing,
          expiresAt: addDays(days),
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          activatedAt: new Date(),
        },
      },
      { new: true },
    ).select("subscription");

    res.json({
      success: true,
      message: "Subscription activated!",
      plan,
      billing,
      expiresAt: vendor.subscription.expiresAt,
      isPro: true,
    });
  } catch (err) {
    console.error("verifyPayment error:", err);
    res.status(500).json({ message: err.message });
  }
}

// ── POST /api/subscription/cancel ────────────────────────────────
// Vendor cancels their own Pro plan → goes back to free immediately.
// Note: Razorpay does not auto-refund — this just downgrades the plan.
// If you want to refund, initiate a refund manually from Razorpay dashboard
// or use the Razorpay Refund API separately.
export async function cancelPlan(req, res) {
  try {
    const vendor = await Vendor.findOne({ userId: req.user.id }).select(
      "subscription",
    );
    if (!vendor)
      return res.status(404).json({ message: "Vendor profile not found" });

    if (!vendor.subscription?.plan || vendor.subscription.plan === "free")
      return res
        .status(400)
        .json({ message: "You are already on the free plan" });

    await Vendor.findOneAndUpdate(
      { userId: req.user.id },
      {
        subscription: {
          plan: "free",
          billing: null,
          expiresAt: null,
          razorpayOrderId: null,
          razorpayPaymentId: null,
          razorpaySignature: null,
          activatedAt: null,
        },
      },
    );

    res.json({
      success: true,
      message: "Subscription cancelled. You are now on the free plan.",
      plan: "free",
    });
  } catch (err) {
    console.error("cancelPlan error:", err);
    res.status(500).json({ message: err.message });
  }
}

// ── PUT /api/subscription/admin/set-plan ─────────────────────────
// SuperAdmin/Admin: manually set any vendor's plan
// Body: { vendorId, plan, durationDays }
export async function adminSetPlan(req, res) {
  try {
    const { vendorId, plan, durationDays } = req.body;

    if (!vendorId || !plan)
      return res
        .status(400)
        .json({ message: "vendorId and plan are required" });

    if (!["free", "pro", "premium"].includes(plan))
      return res.status(400).json({ message: "Invalid plan value" });

    let expiresAt = null;
    if (plan !== "free" && durationDays) {
      expiresAt = addDays(Number(durationDays));
    }

    const vendor = await Vendor.findByIdAndUpdate(
      vendorId,
      {
        subscription: {
          plan,
          billing: durationDays <= 31 ? "monthly" : "yearly",
          expiresAt,
          activatedBy: plan !== "free" ? req.user.id : null,
          activatedAt: plan !== "free" ? new Date() : null,
        },
      },
      { new: true },
    ).select("subscription businessDetails.businessName");

    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    res.json({
      message: `Plan updated to ${plan}`,
      vendor: {
        _id: vendor._id,
        businessName: vendor.businessDetails?.businessName,
        subscription: vendor.subscription,
        isPro: isActivePro(vendor),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// ── PUT /api/subscription/admin/revoke ───────────────────────────
// SuperAdmin/Admin: immediately revoke a vendor's Pro plan
// Body: { vendorId }
export async function adminRevokePlan(req, res) {
  try {
    const { vendorId } = req.body;
    if (!vendorId)
      return res.status(400).json({ message: "vendorId is required" });

    const vendor = await Vendor.findByIdAndUpdate(
      vendorId,
      {
        subscription: {
          plan: "free",
          billing: null,
          expiresAt: null,
          razorpayOrderId: null,
          razorpayPaymentId: null,
          razorpaySignature: null,
          activatedAt: null,
        },
      },
      { new: true },
    ).select("subscription businessDetails.businessName");

    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    res.json({
      success: true,
      message: "Plan revoked successfully",
      vendor,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// ── POST /api/subscription/webhook ───────────────────────────────
// Razorpay webhook backup — activates plan if client-side verify missed
export async function razorpayWebhook(req, res) {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const shasum = crypto.createHmac("sha256", webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if (digest !== req.headers["x-razorpay-signature"])
      return res.status(400).json({ message: "Invalid webhook signature" });

    const event = req.body;

    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      const { userId, plan, billing } = payment.notes || {};

      if (!userId || !plan || !billing || !PLANS[plan]?.[billing])
        return res.json({ received: true });

      const { days } = PLANS[plan][billing];
      const vendor = await Vendor.findOne({ userId });
      if (!vendor) return res.json({ received: true });

      const alreadyActive =
        vendor.subscription?.razorpayPaymentId === payment.id;
      if (!alreadyActive) {
        await Vendor.findOneAndUpdate(
          { userId },
          {
            subscription: {
              plan,
              billing,
              expiresAt: addDays(days),
              razorpayOrderId: payment.order_id,
              razorpayPaymentId: payment.id,
              activatedAt: new Date(),
            },
          },
        );
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error("webhook error:", err);
    res.status(500).json({ message: err.message });
  }
}
