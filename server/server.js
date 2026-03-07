import express from "express";
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
// route modules for resources
import categoryRoutes from "./routes/category.routes.js";
import subCategoryRoutes from "./routes/subCategory.routes.js";
import productRoutes from "./routes/product.routes.js";
import cartRoutes from "./routes/cartRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import reviewRoutes from "./routes/Review.routes.js";
import { uploadsCompat } from "./middleware/staticFix.js";
const app = express();
const PORT = process.env.PORT || 3000;
await connectDB();

const allwedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
];

//middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: allwedOrigins, credentials: true }));
app.use(passport.initialize());
app.use("/uploads", uploadsCompat);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
//routes
// More specific routes first to prevent shadowing
app.use("/api/auth/vendor", vendorAuthRoutes);
app.use("/api/auth/vendor", vendorRoutes);
app.use("/api/auth/delivery", deliveryAuthRoutes);
app.use("/api/auth", userAuthRoutes);
app.use("/api/admin", adminRoutes);

// resource endpoints
app.use("/api/categories", categoryRoutes);
app.use("/api/subcategories", subCategoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/reviews", reviewRoutes);
app.get("/", (req, res) => {
  res.send("server is running");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
