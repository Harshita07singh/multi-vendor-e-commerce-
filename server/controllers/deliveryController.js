// import User from "../models/User.js";
// import jwt from "jsonwebtoken";
// import otpGenerator from "otp-generator";
// import { sendEmail } from "../utils/sendEmail.js";

// // Send OTP for delivery partner verification
// export const sendDeliveryOTP = async (req, res) => {
//   try {
//     const { email, phone } = req.body;

//     if (!email && !phone) {
//       return res.status(400).json({ message: "Email or phone required" });
//     }

//     const identifier = email || phone;
//     const otp = otpGenerator.generate(6, {
//       upperCase: false,
//       specialChars: false,
//     });

//     // Check if user already exists
//     let user = await User.findOne({
//       $or: [{ email: identifier }, { phone: identifier }],
//     });

//     if (user) {
//       if (user.role === "delivery") {
//         // Update existing delivery partner's OTP
//         user.otp = otp;
//         user.otpExpire = Date.now() + 5 * 60 * 1000; // 5 minutes
//         await user.save();
//       } else {
//         // User exists with different role - just update OTP for verification
//         user.otp = otp;
//         user.otpExpire = Date.now() + 5 * 60 * 1000;
//         await user.save();
//       }
//     } else {
//       // Create temporary user with OTP (will be completed during registration)
//       user = await User.create({
//         email: email || undefined,
//         phone: phone || undefined,
//         role: "delivery",
//         otp: otp,
//         otpExpire: Date.now() + 5 * 60 * 1000,
//         status: "pending",
//       });
//     }

//     // Send OTP via Email
//     if (email) {
//       try {
//         await sendEmail(
//           email,
//           "Your Delivery Partner OTP Code",
//           `Your OTP is: ${otp}\n\nThis OTP is valid for 5 minutes.\n\nDo not share this code with anyone.`,
//         );
//       } catch (emailError) {
//         console.error("Email sending failed:", emailError);
//         console.log("OTP for testing:", otp); // Fallback for testing
//       }
//     } else if (phone) {
//       console.log("OTP for phone:", otp); // For testing phone OTP
//     }

//     res.json({
//       message: "OTP sent successfully",
//       email: email || null,
//       phone: phone || null,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Verify OTP for delivery partner
// export const verifyDeliveryOTP = async (req, res) => {
//   try {
//     const { email, phone, otp } = req.body;

//     const identifier = email || phone;
//     if (!identifier || !otp) {
//       return res.status(400).json({ message: "Email/phone and OTP required" });
//     }

//     const user = await User.findOne({
//       $or: [{ email: identifier }, { phone: identifier }],
//     });

//     if (!user || user.otp !== otp || user.otpExpire < Date.now()) {
//       return res.status(400).json({ message: "Invalid or expired OTP" });
//     }

//     // Clear OTP after successful verification
//     user.otp = null;
//     user.otpExpire = null;
//     await user.save();

//     res.json({ message: "OTP verified successfully", verified: true });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Register Delivery Partner
// export const registerDeliveryPartner = async (req, res) => {
//   try {
//     const {
//       name,
//       email,
//       phone,
//       password,
//       aadhaarNumber,
//       panNumber,
//       drivingLicenseNumber,
//       dlExpiryDate,
//       dateOfBirth,
//       gender,
//       city,
//       vehicleType,
//       accountHolderName,
//       accountNumber,
//       ifscCode,
//       termsAccepted,
//     } = req.body;

//     if (!termsAccepted) {
//       return res.status(400).json({
//         message: "You must accept terms & conditions",
//       });
//     }

//     // Check if user already exists
//     let existingUser = await User.findOne({ email });

//     // If user exists with different role, reject
//     if (existingUser && existingUser.role !== "delivery") {
//       return res
//         .status(400)
//         .json({ message: "Email already registered with different role" });
//     }

//     // If user exists as delivery but was created via OTP (incomplete), allow update
//     if (
//       existingUser &&
//       existingUser.role === "delivery" &&
//       !existingUser.name
//     ) {
//       // This is an incomplete registration - allow updating
//       existingUser.name = name;
//       existingUser.phone = phone;
//       existingUser.password = password;
//       existingUser.status = "pending";
//       existingUser.aadhaarNumber = aadhaarNumber;
//       existingUser.aadhaarFront = req.files?.aadhaarFront?.[0]?.filename;
//       existingUser.aadhaarBack = req.files?.aadhaarBack?.[0]?.filename;
//       existingUser.panNumber = panNumber;
//       existingUser.panImage = req.files?.panImage?.[0]?.filename;
//       existingUser.drivingLicenseNumber = drivingLicenseNumber;
//       existingUser.dlFront = req.files?.dlFront?.[0]?.filename;
//       existingUser.dlBack = req.files?.dlBack?.[0]?.filename;
//       existingUser.dlExpiryDate = dlExpiryDate;
//       existingUser.dateOfBirth = dateOfBirth;
//       existingUser.gender = gender;
//       existingUser.city = city;
//       existingUser.vehicleType = vehicleType;
//       existingUser.accountHolderName = accountHolderName;
//       existingUser.accountNumber = accountNumber;
//       existingUser.ifscCode = ifscCode;
//       existingUser.bankProofImage = req.files?.bankProofImage?.[0]?.filename;
//       existingUser.termsAccepted = termsAccepted;

//       await existingUser.save();

//       res.status(201).json({
//         message: "Registration submitted for review",
//       });
//       return;
//     } else if (existingUser) {
//       return res.status(400).json({ message: "User already exists" });
//     }

//     const delivery = await User.create({
//       name,
//       email,
//       phone,
//       password,
//       role: "delivery",
//       status: "pending",

//       aadhaarNumber,
//       aadhaarFront: req.files?.aadhaarFront?.[0]?.filename,
//       aadhaarBack: req.files?.aadhaarBack?.[0]?.filename,

//       panNumber,
//       panImage: req.files?.panImage?.[0]?.filename,

//       drivingLicenseNumber,
//       dlFront: req.files?.dlFront?.[0]?.filename,
//       dlBack: req.files?.dlBack?.[0]?.filename,
//       dlExpiryDate,

//       dateOfBirth,
//       gender,
//       city,
//       vehicleType,

//       accountHolderName,
//       accountNumber,
//       ifscCode,
//       bankProofImage: req.files?.bankProofImage?.[0]?.filename,

//       termsAccepted,
//     });

//     res.status(201).json({
//       message: "Registration submitted for review",
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// export const loginDeliveryPartner = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({ email, role: "delivery" });

//     if (!user) {
//       return res.status(404).json({
//         message: "Delivery partner not found",
//       });
//     }

//     const isMatch = await user.comparePassword(password);

//     if (!isMatch) {
//       return res.status(400).json({
//         message: "Invalid credentials",
//       });
//     }

//     const token = jwt.sign(
//       { id: user._id, role: user.role },
//       process.env.JWT_ACCESS_SECRET,
//       { expiresIn: "7d" },
//     );

//     res.json({
//       message: "Login successful",
//       accessToken: token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         status: user.status,
//         isApproved: user.isApproved,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import otpGenerator from "otp-generator";
import { sendEmail } from "../utils/sendEmail.js";

// Send OTP for delivery partner verification (email only)
export const sendDeliveryOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const otp = otpGenerator.generate(6, {
      upperCase: false,
      specialChars: false,
    });

    // Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      // Update OTP regardless of role
      user.otp = otp;
      user.otpExpire = Date.now() + 5 * 60 * 1000; // 5 minutes
      await user.save();
    } else {
      // Create temporary user (completed during registration)
      user = await User.create({
        email,
        role: "delivery",
        otp,
        otpExpire: Date.now() + 5 * 60 * 1000,
        status: "pending",
      });
    }

    // Send OTP via Email
    try {
      await sendEmail(
        email,
        "Your Delivery Partner OTP Code",
        `Your OTP is: ${otp}\n\nThis OTP is valid for 5 minutes.\n\nDo not share this code with anyone.`,
      );
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      console.log("OTP for testing:", otp);
    }

    res.json({ message: "OTP sent successfully", email });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify OTP for delivery partner (email only)
export const verifyDeliveryOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || user.otpExpire < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Clear OTP after successful verification
    user.otp = null;
    user.otpExpire = null;
    await user.save();

    res.json({ message: "OTP verified successfully", verified: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Register Delivery Partner
export const registerDeliveryPartner = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      aadhaarNumber,
      panNumber,
      drivingLicenseNumber,
      dlExpiryDate,
      dateOfBirth,
      gender,
      city,
      vehicleType,
      vehicleNumber,
      vehicleModel,
      vehicleYear,
      bankName,
      accountHolderName,
      accountNumber,
      ifscCode,
      termsAccepted,
    } = req.body;

    if (!termsAccepted) {
      return res.status(400).json({
        message: "You must accept terms & conditions",
      });
    }

    // Check if user already exists
    let existingUser = await User.findOne({ email });

    // If user exists with different role, reject
    if (existingUser && existingUser.role !== "delivery") {
      return res
        .status(400)
        .json({ message: "Email already registered with different role" });
    }

    // If user exists as delivery but was created via OTP (incomplete), allow update
    if (
      existingUser &&
      existingUser.role === "delivery" &&
      !existingUser.name
    ) {
      existingUser.name = name;
      existingUser.phone = phone;
      existingUser.password = password;
      existingUser.status = "pending";
      existingUser.aadhaarNumber = aadhaarNumber;
      existingUser.aadhaarFront = req.files?.aadhaarFront?.[0]?.filename;
      existingUser.aadhaarBack = req.files?.aadhaarBack?.[0]?.filename;
      existingUser.panNumber = panNumber;
      existingUser.panImage = req.files?.panImage?.[0]?.filename;
      existingUser.drivingLicenseNumber = drivingLicenseNumber;
      existingUser.dlFront = req.files?.dlFront?.[0]?.filename;
      existingUser.dlBack = req.files?.dlBack?.[0]?.filename;
      existingUser.dlExpiryDate = dlExpiryDate;
      existingUser.dateOfBirth = dateOfBirth;
      existingUser.gender = gender;
      existingUser.city = city;
      existingUser.vehicleType = vehicleType;
      existingUser.vehicleNumber = vehicleNumber;
      existingUser.vehicleModel = vehicleModel;
      existingUser.vehicleYear = vehicleYear;
      existingUser.accountHolderName = accountHolderName;
      existingUser.accountNumber = accountNumber;
      existingUser.ifscCode = ifscCode;
      existingUser.bankName = bankName;
      existingUser.bankProofImage = req.files?.bankProofImage?.[0]?.filename;
      existingUser.termsAccepted = termsAccepted;
      existingUser.rcImage = req.files?.rcImage?.[0]?.filename;

      await existingUser.save();
      return res
        .status(201)
        .json({ message: "Registration submitted for review" });
    }

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    await User.create({
      name,
      email,
      phone,
      password,
      role: "delivery",
      status: "pending",
      aadhaarNumber,
      aadhaarFront: req.files?.aadhaarFront?.[0]?.filename,
      aadhaarBack: req.files?.aadhaarBack?.[0]?.filename,
      panNumber,
      panImage: req.files?.panImage?.[0]?.filename,
      drivingLicenseNumber,
      dlFront: req.files?.dlFront?.[0]?.filename,
      dlBack: req.files?.dlBack?.[0]?.filename,
      dlExpiryDate,
      dateOfBirth,
      gender,
      city,
      vehicleType,
      vehicleNumber,
      vehicleModel,
      vehicleYear,
      accountHolderName,
      accountNumber,
      ifscCode,
      bankName,
      bankProofImage: req.files?.bankProofImage?.[0]?.filename,
      termsAccepted,
      rcImage: req.files?.rcImage?.[0]?.filename,
    });

    res.status(201).json({ message: "Registration submitted for review" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginDeliveryPartner = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, role: "delivery" });

    if (!user) {
      return res.status(404).json({ message: "Delivery partner not found" });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      message: "Login successful",
      accessToken: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        isApproved: user.isApproved,
      },
    });
    user.isAvailable = user.isOnline ?? false;
    await user.save();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
