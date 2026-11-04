import mongoose from "mongoose";
import type { NextFunction, Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { Medicine } from "../models/Medicine.js";
import { Sale } from "../models/Sale.js";

type SaleInput = {
  medicineId: string;
  quantity: number;
};

function httpError(message: string, statusCode: number) {
  return Object.assign(new Error(message), { statusCode });
}

export async function createSale(req: AuthRequest, res: Response, next: NextFunction) {
  const session = await mongoose.startSession();
  try {
    let createdSale: mongoose.HydratedDocument<unknown> | undefined;
    await session.withTransaction(async () => {
      const items = [];
      let subtotalCents = 0;
      const saleItems = req.body.items as SaleInput[];

      for (const input of saleItems) {
        const medicine = await Medicine.findOne({
          _id: input.medicineId,
          isActive: true,
          $or: [{ expiryDate: { $exists: false } }, { expiryDate: null }, { expiryDate: { $gt: new Date() } }],
        }).session(session);
        if (!medicine) throw httpError("Médicament introuvable ou périmé", 400);

        const lineTotalCents = medicine.sellingPriceCents * input.quantity;
        if (!Number.isSafeInteger(lineTotalCents)) throw httpError("Montant de vente invalide", 400);
        subtotalCents += lineTotalCents;
        items.push({
          medicine: medicine._id,
          name: medicine.name,
          quantity: input.quantity,
          unitPriceCents: medicine.sellingPriceCents,
          lineTotalCents,
        });
      }

      const discountCents = Number(req.body.discountCents ?? 0);
      const totalCents = subtotalCents - discountCents;
      const amountPaidCents = Number(req.body.amountPaidCents);
      if (discountCents > subtotalCents || amountPaidCents < totalCents) {
        throw httpError("Remise ou montant payé invalide", 400);
      }

      for (const item of items) {
        const result = await Medicine.updateOne(
          { _id: item.medicine, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
          { session }
        );
        if (result.modifiedCount !== 1) throw httpError("Stock insuffisant", 409);
      }

      const [sale] = await Sale.create(
        [{
          cashier: req.user!.id,
          customer: req.body.customerId,
          items,
          subtotalCents,
          discountCents,
          totalCents,
          amountPaidCents,
          changeCents: amountPaidCents - totalCents,
          paymentMethod: req.body.paymentMethod,
        }],
        { session }
      );
      createdSale = sale;
    });

    res.status(201).json({ sale: createdSale });
  } catch (error) {
    next(error);
  } finally {
    await session.endSession();
  }
}

export async function getSale(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const sale = await Sale.findById(req.params.id).populate("cashier", "name");
    if (!sale) {
      res.status(404).json({ message: "Vente introuvable" });
      return;
    }
    res.json({ sale });
  } catch (error) {
    next(error);
  }
}
