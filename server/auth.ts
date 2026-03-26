import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";

const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD 
  ? bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10)
  : bcrypt.hashSync("max123", 10);

export function verifyAdminPassword(password: string): boolean {
  return bcrypt.compareSync(password, ADMIN_PASSWORD_HASH);
}

function checkPasswordAuth(req: Request): boolean {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }
  const token = authHeader.substring(7);
  return bcrypt.compareSync(token, ADMIN_PASSWORD_HASH);
}

function checkReplitSessionAuth(req: Request): boolean {
  if (!req.isAuthenticated || !req.user) {
    return false;
  }
  const user = req.user as any;
  if (!req.isAuthenticated() || !user.expires_at) {
    return false;
  }
  const now = Math.floor(Date.now() / 1000);
  return now <= user.expires_at;
}

export function checkAdminAuth(req: Request, res: Response, next: NextFunction) {
  if (checkReplitSessionAuth(req)) {
    return next();
  }

  if (checkPasswordAuth(req)) {
    return next();
  }

  return res.status(401).json({ error: "Unauthorized" });
}
