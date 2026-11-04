import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User, type UserRole } from "../models/User.js";

export type AuthRequest = Request & {
  user?: { id: string; role: UserRole };
};

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.access_token as string | undefined;
  if (!token) return res.status(401).json({ message: "Authentification requise" });

  let userId: string;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload;
    if (typeof payload.sub !== "string") {
      return res.status(401).json({ message: "Session invalide" });
    }
    userId = payload.sub;
  } catch {
    return res.status(401).json({ message: "Session invalide ou expirée" });
  }

  try {
    const user = await User.findById(userId).select("_id role isActive");
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Compte invalide ou désactivé" });
    }
    req.user = { id: user.id, role: user.role };
    next();
  } catch (error) {
    next(error);
  }
}

export function allowRoles(...roles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Permission insuffisante" });
    }
    next();
  };
}
