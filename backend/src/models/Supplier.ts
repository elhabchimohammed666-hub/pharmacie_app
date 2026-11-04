import { Schema, model } from "mongoose";

const supplierSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 160 },
    contactName: { type: String, trim: true, maxlength: 160 },
    phone: { type: String, trim: true, maxlength: 40 },
    email: { type: String, trim: true, lowercase: true, maxlength: 254 },
    address: { type: String, trim: true, maxlength: 500 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

supplierSchema.index({ name: 1 });
export const Supplier = model("Supplier", supplierSchema);
