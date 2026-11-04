import { Schema, model } from "mongoose";

export type UserRole = "admin" | "pharmacien";

export interface UserDocument {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
}

const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["admin", "pharmacien"], required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const User = model<UserDocument>("User", userSchema);
