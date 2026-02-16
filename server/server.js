import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import "dotenv/config";
import authRoutes from "./routes/UserAuthRoutes.js";
import adminRoutes from "./routes/AdminRoute.js";

const app = express();
const PORT = process.env.PORT || 3000;
await connectDB();
//allow multiple origins

const allwedOrigins = ["http://localhost:5173"];
//middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: allwedOrigins, credentials: true }));

//routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.get("/", (req, res) => {
  res.send("server is running");
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
