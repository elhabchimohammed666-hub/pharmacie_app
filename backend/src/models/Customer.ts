import { Schema, model } from "mongoose";

const customerSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 160 },
    phone: { type: String, trim: true, maxlength: 40 },
    email: { type: String, trim: true, lowercase: true, maxlength: 254 },
    notes: { type: String, trim: true, maxlength: 1000 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

customerSchema.index({ phone: 1 });
export const Customer = model("Customer", customerSchema);
