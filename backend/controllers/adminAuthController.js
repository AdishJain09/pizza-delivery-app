import bcrypt from "bcryptjs";
import Admin from "../models/Admin.js";
import { signToken } from "../utils/generateToken.js";

export const adminLogin = async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email });
  if (!admin) return res.status(401).json({ message: "Invalid admin credentials" });

  const match = await bcrypt.compare(password, admin.password);
  if (!match) return res.status(401).json({ message: "Invalid admin credentials" });

  const token = signToken({ id: admin._id, role: "admin" });
  res.json({
    token,
    admin: { id: admin._id, name: admin.name, email: admin.email }
  });
};
