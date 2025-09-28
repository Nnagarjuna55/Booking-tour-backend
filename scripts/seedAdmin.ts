import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "../src/models/Admin";
import bcrypt from "bcryptjs";

dotenv.config();

const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/tourist_platform";

async function run() {
  await mongoose.connect(mongoURI);
  const email = process.env.SEED_ADMIN_EMAIL || "admin@example.com";
  const password = process.env.SEED_ADMIN_PASSWORD || "password123";

  const existing = await Admin.findOne({ email });
  if (existing) {
    console.log(`Admin with email ${email} already exists`);
    process.exit(0);
  }

  const hashed = await bcrypt.hash(password, 10);
  const admin = new Admin({ email, password: hashed, role: "SUPER_ADMIN" });
  await admin.save();
  console.log(`Created admin: ${email} / ${password}`);
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
