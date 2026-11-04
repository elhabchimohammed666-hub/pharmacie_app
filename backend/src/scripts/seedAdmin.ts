import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { User } from "../models/User.js";

async function seedAdmin() {
  const { MONGODB_URI, ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!MONGODB_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error("Définir MONGODB_URI, ADMIN_EMAIL et ADMIN_PASSWORD avant le seed");
  }
  if (ADMIN_PASSWORD.length < 12) {
    throw new Error("ADMIN_PASSWORD doit contenir au moins 12 caractères");
  }

  await mongoose.connect(MONGODB_URI);
  const email = ADMIN_EMAIL.toLowerCase().trim();
  const existing = await User.findOne({ email });
  if (existing) throw new Error(`Un compte existe déjà pour ${email}`);

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await User.create({
    name: ADMIN_NAME ?? "Gérant",
    email,
    passwordHash,
    role: "admin",
  });
  console.log(`Compte gérant créé : ${email}`);
  await mongoose.disconnect();
}

seedAdmin().catch(async (error: unknown) => {
  console.error("Admin seed failed", error);
  await mongoose.disconnect();
  process.exitCode = 1;
});
