import type { NextFunction, Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { Medicine } from "../models/Medicine.js";
import { Sale } from "../models/Sale.js";

export async function summary(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const expiryLimit = new Date(now);
    expiryLimit.setDate(expiryLimit.getDate() + 90);

    const [sales, monthSales, lowStockCount, expiringSoonCount, expiredCount, topProducts] = await Promise.all([
      Sale.aggregate([
        { $match: { createdAt: { $gte: startOfDay, $lt: endOfDay } } },
        { $group: { _id: null, revenueCents: { $sum: "$totalCents" }, salesCount: { $sum: 1 } } },
      ]),
      Sale.aggregate([
        { $match: { createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, revenueCents: { $sum: "$totalCents" } } },
      ]),
      Medicine.countDocuments({ isActive: true, $expr: { $lte: ["$stock", "$lowStockThreshold"] } }),
      Medicine.countDocuments({
        isActive: true,
        expiryDate: { $gte: now, $lte: expiryLimit },
      }),
      Medicine.countDocuments({
        isActive: true,
        expiryDate: { $lt: now },
      }),
      Sale.aggregate([
        { $match: { createdAt: { $gte: startOfDay, $lt: endOfDay } } },
        { $unwind: "$items" },
        { $group: { _id: "$items.medicine", name: { $first: "$items.name" }, quantity: { $sum: "$items.quantity" } } },
        { $sort: { quantity: -1 } },
        { $limit: 5 },
      ]),
    ]);

    res.json({
      todayRevenueCents: sales[0]?.revenueCents ?? 0,
      todaySalesCount: sales[0]?.salesCount ?? 0,
      monthRevenueCents: monthSales[0]?.revenueCents ?? 0,
      lowStockCount,
      expiringSoonCount,
      expiredCount,
      topProducts,
    });
  } catch (error) {
    next(error);
  }
}
