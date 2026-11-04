import type { NextFunction, Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { Medicine } from "../models/Medicine.js";

const editableFields = [
  "name",
  "barcode",
  "description",
  "category",
  "supplier",
  "purchasePriceCents",
  "sellingPriceCents",
  "stock",
  "lowStockThreshold",
  "expiryDate",
  "location",
] as const;

function medicineInput(body: Record<string, unknown>) {
  return Object.fromEntries(
    editableFields
      .filter((field) => body[field] !== undefined)
      .map((field) => [field, body[field]])
      .filter(([field, value]) => field !== "barcode" || (typeof value === "string" && value.trim() !== ""))
  );
}

export async function list(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const search = String(req.query.search ?? "").trim();
    const filter = {
      isActive: true,
      ...(search ? { $or: [{ name: { $regex: escapeRegex(search), $options: "i" } }, { barcode: search }] } : {}),
    };
    const [items, total] = await Promise.all([
      Medicine.find(filter).sort({ name: 1 }).skip((page - 1) * limit).limit(limit),
      Medicine.countDocuments(filter),
    ]);
    res.json({ items, page, limit, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
}

export async function getById(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const medicine = await Medicine.findOne({ _id: req.params.id, isActive: true });
    if (!medicine) {
      res.status(404).json({ message: "Médicament introuvable" });
      return;
    }
    res.json({ medicine });
  } catch (error) {
    next(error);
  }
}

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const medicine = await Medicine.create(medicineInput(req.body as Record<string, unknown>));
    res.status(201).json({ medicine });
  } catch (error) {
    next(error);
  }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const medicine = await Medicine.findOneAndUpdate(
      { _id: req.params.id, isActive: true },
      medicineInput(req.body as Record<string, unknown>),
      { new: true, runValidators: true }
    );
    if (!medicine) {
      res.status(404).json({ message: "Médicament introuvable" });
      return;
    }
    res.json({ medicine });
  } catch (error) {
    next(error);
  }
}

export async function archive(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const medicine = await Medicine.findOneAndUpdate(
      { _id: req.params.id, isActive: true },
      { isActive: false },
      { new: true }
    );
    if (!medicine) {
      res.status(404).json({ message: "Médicament introuvable" });
      return;
    }
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
