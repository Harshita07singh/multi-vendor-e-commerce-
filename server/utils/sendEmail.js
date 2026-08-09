import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // port 465 = SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // ← self-signed certificate fix
  },
});

export const sendEmail = async (to, subject, message) => {
  const isHtml =
    message.trimStart().startsWith("<!DOCTYPE") ||
    message.trimStart().startsWith("<html") ||
    message.trimStart().startsWith("<table") ||
    message.trimStart().startsWith("<div");

  const info = await transporter.sendMail({
    from: `"SellerHub" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    ...(isHtml ? { html: message } : { text: message }),
  });

  console.log("✓ Email sent:", info.messageId);
};
