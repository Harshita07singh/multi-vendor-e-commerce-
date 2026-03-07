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
    return res.status(401).json({ message: "Relogin" });
  }
};

// Use on any route where a vendor should only access their OWN resource
// Example: GET /api/orders/:vendorId  →  must match req.user._id
export const authorizeOwnData = (req, res, next) => {
  const requestedId = req.params.vendorId || req.params.id;

  if (requestedId && requestedId !== req.user._id.toString()) {
    return res
      .status(403)
      .json({ message: "Access denied: You can only view your own data" });
  }

  next();
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
