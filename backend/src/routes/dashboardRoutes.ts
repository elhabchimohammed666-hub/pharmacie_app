import { Router } from "express";
import { summary } from "../controllers/dashboardController.js";
import { allowRoles, requireAuth } from "../middleware/auth.js";

const router = Router();
router.get("/summary", requireAuth, allowRoles("admin"), summary);

export default router;
