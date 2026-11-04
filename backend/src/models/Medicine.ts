import { Schema, model } from "mongoose";

export interface MedicineDocument {
  name: string;
  barcode?: string;
  description?: string;
  category?: Schema.Types.ObjectId;
  supplier?: Schema.Types.ObjectId;
  purchasePriceCents: number;
  sellingPriceCents: number;
  stock: number;
  lowStockThreshold: number;
  expiryDate?: Date;
  location?: string;
  isActive: boolean;
}

const medicineSchema = new Schema<MedicineDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 160 },
    barcode: { type: String, trim: true, sparse: true, unique: true },
    description: { type: String, trim: true, maxlength: 2000 },
    category: { type: Schema.Types.ObjectId, ref: "Category" },
    supplier: { type: Schema.Types.ObjectId, ref: "Supplier" },
    purchasePriceCents: { type: Number, required: true, min: 0 },
    sellingPriceCents: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    lowStockThreshold: { type: Number, min: 0, default: 10 },
    expiryDate: Date,
    location: { type: String, trim: true, maxlength: 100 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

medicineSchema.index({ name: "text", barcode: "text" });
medicineSchema.index({ expiryDate: 1 });

export const Medicine = model<MedicineDocument>("Medicine", medicineSchema);
