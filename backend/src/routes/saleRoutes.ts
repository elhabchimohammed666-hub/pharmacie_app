import { Router } from "express";
import { body, param } from "express-validator";
import { createSale, getSale } from "../controllers/saleController.js";
import { requireAuth } from "../middleware/auth.js";
import { validateRequest } from "../middleware/errors.js";

const router = Router();
router.use(requireAuth);
router.post(
  "/",
  body("items").isArray({ min: 1, max: 100 }),
  body("items.*.medicineId").isMongoId(),
  body("items.*.quantity").isInt({ min: 1, max: 10000 }),
  body("discountCents").optional().isInt({ min: 0 }),
  body("amountPaidCents").isInt({ min: 0 }),
  body("paymentMethod").isIn(["cash", "card", "mobile"]),
  body("customerId").optional({ values: "falsy" }).isMongoId(),
  validateRequest,
  createSale
);
router.get("/:id", param("id").isMongoId(), validateRequest, getSale);

export default router;
