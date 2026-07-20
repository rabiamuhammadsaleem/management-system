import { Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { UserService } from "../services/userService.ts";
import { AuthenticatedRequest } from "../middleware/auth.ts";

const JWT_SECRET = process.env.JWT_SECRET || "super_secure_internship_project_secret_key_2026";
const JWT_EXPIRES_IN = "24h";

export class AuthController {
  static async register(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        res.status(400).json({ message: "All fields are required (name, email, password)" });
        return;
      }

      if (password.length < 6) {
        res.status(400).json({ message: "Password must be at least 6 characters long" });
        return;
      }

      // Check if user already exists
      const existingUser = await UserService.findByEmail(email);
      if (existingUser) {
        res.status(400).json({ message: "An account with this email already exists" });
        return;
      }

      // Create new user
      const user = await UserService.create({ name, email, password });

      // Generate JWT Token
      const token = jwt.sign(
        { id: user._id || user.id, name: user.name, email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      res.status(201).json({
        message: "Registration successful",
        user: {
          id: user._id || user.id,
          name: user.name,
          email: user.email,
        },
        token,
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Internal server error during registration" });
    }
  }

  static async login(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ message: "Email and password are required" });
        return;
      }

      // Find user
      const user = await UserService.findByEmail(email);
      if (!user) {
        res.status(400).json({ message: "Invalid email or password" });
        return;
      }

      // Check password
      let isMatch = false;
      if (user.comparePassword) {
        // Falling back to custom compare function on mock schema
        isMatch = await user.comparePassword(password);
      } else {
        // Standard Mongoose model comparison
        isMatch = await bcrypt.compare(password, user.password);
      }

      if (!isMatch) {
        res.status(400).json({ message: "Invalid email or password" });
        return;
      }

      // Generate JWT Token
      const token = jwt.sign(
        { id: user._id || user.id, name: user.name, email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      res.status(200).json({
        message: "Login successful",
        user: {
          id: user._id || user.id,
          name: user.name,
          email: user.email,
        },
        token,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error during login" });
    }
  }

  static async getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }
      res.status(200).json({ user: req.user });
    } catch (error) {
      console.error("Get current user error:", error);
      res.status(500).json({ message: "Internal server error retrieving user details" });
    }
  }
}
