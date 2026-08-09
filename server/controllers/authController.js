import User from "../models/User.js";
import jwt from "jsonwebtoken";
import otpGenerator from "otp-generator";
import { sendEmail } from "../utils/sendEmail.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load logo once at startup — safe fallback if file missing
function getLogoSrc() {
  try {
    const logoPath = path.join(__dirname, "../uploads/image-1771933872667.png");
    const logoBase64 = fs.readFileSync(logoPath).toString("base64");
    return `data:image/png;base64,${logoBase64}`;
  } catch {
    // Fallback: placeholder if logo file not found
    return "https://placehold.co/40x40/059669/ffffff?text=3A";
  }
}

const LOGO_SRC = getLogoSrc();

export const sendOTP = async (req, res) => {
  try {
    const { emailOrPhone } = req.body;

    if (!emailOrPhone) {
      return res.status(400).json({ message: "Email or phone required" });
    }

    const otp = otpGenerator.generate(6, {
      digits: true,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    let user =
      (await User.findOne({ email: emailOrPhone })) ||
      (await User.findOne({ phone: emailOrPhone }));

    if (!user) {
      user = await User.create({
        email: emailOrPhone.includes("@") ? emailOrPhone : undefined,
        phone: !emailOrPhone.includes("@") ? emailOrPhone : undefined,
        role: "vendor",
        password: "pending_otp_verification",
      });
    }

    user.otp = otp;
    user.otpExpire = Date.now() + 5 * 60 * 1000;
    await user.save();

    if (emailOrPhone.includes("@")) {
      try {
        await sendEmail(
          emailOrPhone,
          "Your SellerHub OTP Code",
          getOtpEmailHtml(otp),
        );
        console.log("OTP email sent to:", emailOrPhone);
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
        console.log("OTP for testing:", otp);
      }
    } else {
      console.log("OTP for phone:", otp);
    }

    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── HTML Email Template ───────────────────────────────────────────────────────
function getOtpEmailHtml(otp) {
  const digits = otp.toString().split("");

  const digitBoxes = digits
    .map(
      (d) => `
        <td style="padding:0 5px;">
          <table cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="
                width:48px;
                height:56px;
                background:#ffffff;
                border:2px solid #d1fae5;
                border-radius:12px;
                text-align:center;
                vertical-align:middle;
                font-family:Georgia,serif;
                font-size:26px;
                font-weight:700;
                color:#065f46;
              ">${d}</td>
            </tr>
          </table>
        </td>
      `,
    )
    .join("");

  // ── NOTE: ${logoSrc} fixed — was {logoSrc} (JSX syntax, wrong in template strings)
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Your OTP Code</title>
</head>
<body style="margin:0;padding:0;background:#f0fdf4;font-family:'Helvetica Neue',Helvetica,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0"
    style="background:#f0fdf4;padding:40px 16px;">
    <tr>
      <td align="center">

        <table width="100%" cellpadding="0" cellspacing="0" border="0"
          style="max-width:520px;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #d1fae5;">

          <!-- Header -->
          <tr>
            <td style="background:#059669;padding:32px 40px 28px;text-align:center;">
              <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 14px;">
                <tr>
                  <td style="
                    background:#ffffff;
                    border-radius:50%;
                    width:64px;
                    height:64px;
                    text-align:center;
                    vertical-align:middle;
                  ">
                
                  </td>
                </tr>
              </table>
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;
                          letter-spacing:0.5px;font-family:Georgia,serif;">
                SellerHub
              </h1>
              <p style="margin:6px 0 0;color:#a7f3d0;font-size:12px;
                         letter-spacing:1.5px;text-transform:uppercase;">
                Vendor Portal
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px 28px;">
              <h2 style="margin:0 0 8px;font-size:20px;color:#064e3b;
                          font-weight:700;font-family:Georgia,serif;">
                Verify Your Identity
              </h2>
              <p style="margin:0 0 28px;color:#6b7280;font-size:14px;line-height:1.6;">
                Use the one-time password below to complete your login.
                This code expires in
                <strong style="color:#059669;">5 minutes</strong>.
              </p>

              <!-- OTP digits -->
              <table cellpadding="0" cellspacing="0" border="0"
                style="margin:0 auto 28px;">
                <tr>${digitBoxes}</tr>
              </table>

              <!-- Divider -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%"
                style="margin:0 0 20px;">
                <tr>
                  <td style="border-top:1px solid #d1fae5;font-size:0;line-height:0;">&nbsp;</td>
                </tr>
              </table>

              <!-- Warning -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%"
                style="background:#f0fdf4;border-left:4px solid #10b981;">
                <tr>
                  <td style="padding:12px 16px;">
                    <p style="margin:0;font-size:12px;color:#065f46;line-height:1.6;">
                      &#128274; <strong>Never share this code</strong> with anyone,
                      including SellerHub support. We will never ask for your OTP.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:20px 40px;text-align:center;
                        border-top:1px solid #e5e7eb;">
              <p style="margin:0 0 4px;font-size:11px;color:#9ca3af;">
                If you didn't request this OTP, please ignore this email.
              </p>
              <p style="margin:0;font-size:11px;color:#d1d5db;">
                &copy; 2026 3Arrow SellerHub &middot; All rights reserved
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;
}

// ── Verify OTP ────────────────────────────────────────────────────────────────
export const verifyOTP = async (req, res) => {
  try {
    const { emailOrPhone, otp } = req.body;

    const user =
      (await User.findOne({ email: emailOrPhone })) ||
      (await User.findOne({ phone: emailOrPhone }));

    if (!user || user.otp !== otp || user.otpExpire < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.otp = null;
    user.otpExpire = null;
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "7d" },
    );

    const vendorData = {
      _id: user._id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
    };

    res.json({
      message: "Login successful",
      token,
      user: vendorData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
