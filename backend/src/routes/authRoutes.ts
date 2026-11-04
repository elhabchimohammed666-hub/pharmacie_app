import { Router } from "express";
import { body } from "express-validator";
import { currentUser, login, logout } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";
import { validateRequest } from "../middleware/errors.js";

const router = Router();
router.post(
  "/login",
  body("email").isEmail().normalizeEmail(),
  body("password").isString().isLength({ min: 1, max: 200 }),
  validateRequest,
  login
);
router.post("/logout", logout);
router.get("/me", requireAuth, currentUser);

export default router;
