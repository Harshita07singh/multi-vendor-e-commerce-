import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import "dotenv/config";
import userAuthRoutes from "./routes/UserAuthRoutes.js";
import adminRoutes from "./routes/AdminRoute.js";
import vendorAuthRoutes from "./routes/authRoutes.js";
import "./config/passport.js";
import passport from "passport";

const app = express();
const PORT = process.env.PORT || 3000;
await connectDB();

const allwedOrigins = ["http://localhost:5173", "http://localhost:5174"];

//middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: allwedOrigins, credentials: true }));
app.use(passport.initialize());

//routes
app.use("/api/auth", userAuthRoutes);
app.use("/api/auth/vendor", vendorAuthRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("server is running");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
