import express from "express";
import http from "http"; // ← NEW
import { Server } from "socket.io"; // ← NEW  (npm i socket.io)
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import "dotenv/config";
import userAuthRoutes from "./routes/UserAuthRoutes.js";
import adminRoutes from "./routes/AdminRoute.js";
import vendorAuthRoutes from "./routes/authRoutes.js";
import deliveryAuthRoutes from "./routes/deliveryAuthRoutes.js";
import vendorRoutes from "./routes/vendorRoutes.js";
import "./config/passport.js";
import passport from "passport";
import path from "path";
import categoryRoutes from "./routes/category.routes.js";
import subCategoryRoutes from "./routes/subCategory.routes.js";
import productRoutes from "./routes/product.routes.js";
import cartRoutes from "./routes/cartRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import orderRoutes from "./routes/Orderroutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import reviewRoutes from "./routes/Review.routes.js";
import flashSaleRoutes from "./routes/Flashsale.routes.js";
import { uploadsCompat } from "./middleware/Staticfix.js";
import { fileURLToPath } from "url";
import heroBannersRouter from "./routes/heroBanners.js";
import locationRoutes from "./routes/Locationroutes.js";
import subscriptionRoutes from "./routes/Subscription.routes.js";
import inventoryRoutes from "./routes/Inventoryroutes.js";
import deliveryDashboardRoutes from "./routes/Deliverydashboardroutes.js";
import { searchRouter } from "./controllers/Search.js";
import razorpayRoutes from "./routes/Razorpayroutes.js";
// ── NEW: Socket.IO helpers ────────────────────────────────────────────────────
import { setIO } from "./socket/Socketmanager.js";
import { registerDeliverySocket } from "./socket/Deliverysockethandler.js";
// ─────────────────────────────────────────────────────────────────────────────
import { setupSearch } from "./services/Searchsetup.js";
import contactRoutes from "./routes/Contactroutes.js";
const app = express();
const PORT = process.env.PORT || 3000;
await connectDB();
await setupSearch();
// ── NEW: wrap Express in an HTTP server so Socket.IO can share the same port ──
const httpServer = http.createServer(app);
// ─────────────────────────────────────────────────────────────────────────────

const allwedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
  "https://3arrow24x7.com",
  "https://www.3arrow24x7.com",
  "https://vendor.3arrow24x7.com",
  "https://www.vendor.3arrow24x7.com",
];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// middleware
app.use("/api/subscription/webhook", express.raw({ type: "application/json" }));
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: allwedOrigins, credentials: true }));
app.use(passport.initialize());
app.use("/uploads", uploadsCompat);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use(
  "/uploads/images",
  express.static(path.join(__dirname, "uploads", "images")),
);
app.use("/api/payments", razorpayRoutes);
app.use(
  "/uploads/images",
  express.static(path.join(process.cwd(), "uploads", "images")),
);

// ── NEW: Boot Socket.IO ───────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: allwedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
  pingTimeout: 20_000,
  pingInterval: 25_000,
});

setIO(io); // store singleton — controllers call getIO()
registerDeliverySocket(io); // auth middleware + all delivery events
// ─────────────────────────────────────────────────────────────────────────────

// routes
app.use("/api/auth/vendor", vendorAuthRoutes);
app.use("/api/auth/vendor", vendorRoutes);
app.use("/api/auth/delivery", deliveryAuthRoutes);
app.use("/api/auth", userAuthRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/subcategories", subCategoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/flash-sales", flashSaleRoutes);
app.use("/api/hero-banners", heroBannersRouter);
app.use("/api/locations", locationRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/delivery", deliveryDashboardRoutes);
app.use("/api/search", searchRouter);
app.use("/api/contact", contactRoutes);
app.get("/", (req, res) => res.send("server is running"));

// ── NEW: listen on httpServer (not app) so Socket.IO shares the port ──────────
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
