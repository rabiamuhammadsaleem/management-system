import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserService } from "../services/userService.ts";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ message: "Access denied. No authentication token provided." });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET || "super_secure_internship_project_secret_key_2026";
    const decoded = jwt.verify(token, secret) as { id: string; name: string; email: string };

    const user = await UserService.findById(decoded.id);
    if (!user) {
      res.status(401).json({ message: "User session not found. Please log in again." });
      return;
    }

    req.user = {
      id: decoded.id,
      name: user.name,
      email: user.email,
    };
    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired token. Please log in again." });
  }
};
