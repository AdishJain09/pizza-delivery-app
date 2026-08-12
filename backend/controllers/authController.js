import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { signToken, randomToken } from "../utils/generateToken.js";
import { sendEmail } from "../utils/sendEmail.js";

export const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ message: "Email already registered" });

  const hashed = await bcrypt.hash(password, 10);
  const verifyToken = randomToken();
  const user = await User.create({
    name,
    email,
    password: hashed,
    verifyToken,
    verifyTokenExpiry: Date.now() + 1000 * 60 * 60 * 24
  });

  const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verifyToken}`;
  await sendEmail({
    to: email,
    subject: "Verify your Pizza Delivery account",
    html: `<p>Hi ${name},</p><p>Click below to verify your email:</p><a href="${verifyUrl}">${verifyUrl}</a>`
  });

  res.status(201).json({ message: "Registered. Please check your email to verify your account.", userId: user._id });
};

export const verifyEmail = async (req, res) => {
  const { token } = req.params;
  const user = await User.findOne({ verifyToken: token, verifyTokenExpiry: { $gt: Date.now() } });
  if (!user) return res.status(400).json({ message: "Invalid or expired verification link" });

  user.isVerified = true;
  user.verifyToken = undefined;
  user.verifyTokenExpiry = undefined;
  await user.save();

  res.json({ message: "Email verified successfully. You can now log in." });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: "Invalid credentials" });

  if (!user.isVerified) {
    return res.status(403).json({ message: "Please verify your email before logging in" });
  }

  const token = signToken({ id: user._id, role: "user" });
  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email }
  });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(200).json({ message: "If that email exists, a reset link has been sent." });

  const resetToken = randomToken();
  user.resetToken = resetToken;
  user.resetTokenExpiry = Date.now() + 1000 * 60 * 30;
  await user.save();

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  await sendEmail({
    to: email,
    subject: "Reset your Pizza Delivery password",
    html: `<p>Click below to reset your password. This link expires in 30 minutes.</p><a href="${resetUrl}">${resetUrl}</a>`
  });

  res.json({ message: "If that email exists, a reset link has been sent." });
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  const user = await User.findOne({ resetToken: token, resetTokenExpiry: { $gt: Date.now() } });
  if (!user) return res.status(400).json({ message: "Invalid or expired reset link" });

  user.password = await bcrypt.hash(password, 10);
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;
  await user.save();

  res.json({ message: "Password reset successfully. You can now log in." });
};

export const getMe = async (req, res) => {
  res.json({ user: req.user });
};
