import { randomUUID } from "node:crypto";
import { Schema, model } from "mongoose";

const saleItemSchema = new Schema(
  {
    medicine: { type: Schema.Types.ObjectId, ref: "Medicine", required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPriceCents: { type: Number, required: true, min: 0 },
    lineTotalCents: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const saleSchema = new Schema(
  {
    saleNumber: { type: String, unique: true, default: randomUUID },
    cashier: { type: Schema.Types.ObjectId, ref: "User", required: true },
    customer: { type: Schema.Types.ObjectId, ref: "Customer" },
    items: { type: [saleItemSchema], required: true },
    subtotalCents: { type: Number, required: true, min: 0 },
    discountCents: { type: Number, required: true, min: 0, default: 0 },
    totalCents: { type: Number, required: true, min: 0 },
    amountPaidCents: { type: Number, required: true, min: 0 },
    changeCents: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: ["cash", "card", "mobile"], required: true },
  },
  { timestamps: true }
);

saleSchema.index({ createdAt: -1 });
export const Sale = model("Sale", saleSchema);
