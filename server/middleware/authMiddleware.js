import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Verify Token
export const protect = async (req, res, next) => {
  try {
    let token = req.headers.authorization?.split(" ")[1] || req.cookies.token;

    if (!token) return res.status(401).json({ message: "Not authorized" });

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    req.user = await User.findById(decoded.id).select("-password");

    next();
  } catch (error) {
    return res.status(401).json({ message: "Token failed" });
  }
};

// Role Authorization
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied",
      });
    }
    next();
  };
};
