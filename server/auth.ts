import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";

// Simple admin password - In production, this should be in environment variables
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD 
  ? bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10)
  : bcrypt.hashSync("max123", 10); // Default password for development

export function checkAdminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Missing admin token" });
  }

  const token = authHeader.substring(7);
  
  // Simple password check
  const isValid = bcrypt.compareSync(token, ADMIN_PASSWORD_HASH);
  
  if (!isValid) {
    return res.status(401).json({ error: "Unauthorized: Invalid admin token" });
  }

  next();
}

export function verifyAdminPassword(password: string): boolean {
  return bcrypt.compareSync(password, ADMIN_PASSWORD_HASH);
}
