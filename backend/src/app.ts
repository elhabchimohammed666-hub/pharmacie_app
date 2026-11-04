import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import medicineRoutes from "./routes/medicineRoutes.js";
import saleRoutes from "./routes/saleRoutes.js";
import { errorHandler, notFound } from "./middleware/errors.js";

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
  credentials: true,
}));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth/login", rateLimit({ windowMs: 15 * 60 * 1000, limit: 10 }));
app.use("/api/auth", authRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
