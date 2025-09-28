import bcrypt from "bcryptjs";
import jwt, { SignOptions, Secret } from "jsonwebtoken";
import Admin, { IAdmin } from "../models/Admin";
import { config } from "../config/env";

export const registerAdmin = async (
  email: string,
  password: string,
  role: "SUPER_ADMIN" | "STAFF" = "STAFF"
): Promise<IAdmin> => {
  const existing = await Admin.findOne({ email });
  if (existing) throw new Error("Admin already exists");

  const hashed = await bcrypt.hash(password, 10);
  const admin = new Admin({ email, password: hashed, role });
  return admin.save();
};

export const loginAdmin = async (email: string, password: string) => {
  const admin = await Admin.findOne({ email });
  if (!admin) throw new Error("Invalid credentials");

  const valid = await bcrypt.compare(password, admin.password);
  if (!valid) throw new Error("Invalid credentials");

  const secret: Secret = config.jwtSecret as Secret;
  const options: SignOptions = { expiresIn: config.jwtExpiry as unknown as SignOptions['expiresIn'] };

  const token = jwt.sign(
    { id: admin._id, role: admin.role } as Record<string, unknown>,
    secret,
    options
  );

  return { token, admin };
};
