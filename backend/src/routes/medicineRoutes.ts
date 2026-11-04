import { Router } from "express";
import { body, param } from "express-validator";
import * as medicines from "../controllers/medicineController.js";
import { allowRoles, requireAuth } from "../middleware/auth.js";
import { validateRequest } from "../middleware/errors.js";

const router = Router();
const medicineFields = [
  body("name").trim().notEmpty().isLength({ max: 160 }),
  body("purchasePriceCents").isInt({ min: 0 }),
  body("purchasePriceCents").toInt(),
  body("sellingPriceCents").isInt({ min: 0 }).toInt(),
  body("stock").optional().isInt({ min: 0 }).toInt(),
  body("lowStockThreshold").optional().isInt({ min: 0 }).toInt(),
  body("barcode").optional({ values: "falsy" }).isString().trim().isLength({ max: 100 }),
  body("description").optional({ values: "falsy" }).isString().trim().isLength({ max: 2000 }),
  body("category").optional({ values: "falsy" }).isMongoId(),
  body("supplier").optional({ values: "falsy" }).isMongoId(),
  body("location").optional({ values: "falsy" }).isString().trim().isLength({ max: 100 }),
  body("expiryDate").optional({ values: "falsy" }).isISO8601().toDate(),
];

router.use(requireAuth);
router.get("/", medicines.list);
router.post("/", allowRoles("admin", "pharmacien"), medicineFields, validateRequest, medicines.create);
router.get("/:id", param("id").isMongoId(), validateRequest, medicines.getById);
router.patch(
  "/:id",
  allowRoles("admin", "pharmacien"),
  param("id").isMongoId(),
  body("name").optional().trim().notEmpty().isLength({ max: 160 }),
  body("purchasePriceCents").optional().isInt({ min: 0 }).toInt(),
  body("sellingPriceCents").optional().isInt({ min: 0 }).toInt(),
  body("stock").optional().isInt({ min: 0 }).toInt(),
  body("lowStockThreshold").optional().isInt({ min: 0 }).toInt(),
  body("barcode").optional({ values: "falsy" }).isString().trim().isLength({ max: 100 }),
  body("description").optional({ values: "falsy" }).isString().trim().isLength({ max: 2000 }),
  body("category").optional({ values: "falsy" }).isMongoId(),
  body("supplier").optional({ values: "falsy" }).isMongoId(),
  body("location").optional({ values: "falsy" }).isString().trim().isLength({ max: 100 }),
  body("expiryDate").optional({ values: "falsy" }).isISO8601().toDate(),
  validateRequest,
  medicines.update
);
router.delete("/:id", allowRoles("admin"), param("id").isMongoId(), validateRequest, medicines.archive);

export default router;
