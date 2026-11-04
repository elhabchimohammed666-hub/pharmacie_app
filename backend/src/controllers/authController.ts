import bcrypt from "bcryptjs";
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import type { AuthRequest } from "../middleware/auth.js";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge: 8 * 60 * 60 * 1000,
};

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const email = String(req.body.email).toLowerCase().trim();
    const user = await User.findOne({ email }).select("+passwordHash");
    if (!user || !user.isActive || !(await bcrypt.compare(String(req.body.password), user.passwordHash))) {
      res.status(401).json({ message: "Identifiants invalides" });
      return;
    }

    const token = jwt.sign({}, process.env.JWT_SECRET!, { subject: user.id, expiresIn: "8h" });
    res.cookie("access_token", token, cookieOptions);
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    next(error);
  }
}

export function logout(_req: Request, res: Response) {
  res.clearCookie("access_token", { ...cookieOptions, maxAge: undefined });
  res.status(204).end();
}

export async function currentUser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await User.findById(req.user!.id).select("name email role");
    res.json({ user });
  } catch (error) {
    next(error);
  }
}
