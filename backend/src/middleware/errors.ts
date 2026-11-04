import type { ErrorRequestHandler, RequestHandler } from "express";
import { validationResult } from "express-validator";

export const validateRequest: RequestHandler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: "Données invalides", errors: errors.array() });
    return;
  }
  next();
};

export const notFound: RequestHandler = (_req, res) => {
  res.status(404).json({ message: "Ressource introuvable" });
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  console.error(error);
  const status = Number(error.statusCode) || 500;
  res.status(status).json({
    message: status >= 500 ? "Erreur interne du serveur" : error.message,
  });
};
