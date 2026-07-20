import { User } from "../models/User.ts";
import { getUsers, saveUsers } from "./dbService.ts";
import { getDbStatus } from "../config/db.ts";
import bcrypt from "bcryptjs";

export class UserService {
  static async findByEmail(email: string): Promise<any> {
    const { connected } = getDbStatus();

    if (connected) {
      return await (User as any).findOne({ email: email.toLowerCase() });
    } else {
      const users = getUsers();
      const user = users.find((u) => u.email === email.toLowerCase());
      if (user) {
        // Return structured user with helper to compare password
        return {
          ...user,
          comparePassword: async (candidate: string) => {
            return await bcrypt.compare(candidate, user.password);
          }
        };
      }
      return null;
    }
  }

  static async findById(id: string): Promise<any> {
    const { connected } = getDbStatus();

    if (connected) {
      return await (User as any).findById(id).select("-password");
    } else {
      const users = getUsers();
      const user = users.find((u) => u._id === id);
      if (user) {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }
      return null;
    }
  }

  static async create(userData: any): Promise<any> {
    const { connected } = getDbStatus();
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const emailLower = userData.email.toLowerCase();

    if (connected) {
      return await (User as any).create({
        name: userData.name,
        email: emailLower,
        password: hashedPassword,
      });
    } else {
      const users = getUsers();
      
      // Check for duplicate
      if (users.some((u) => u.email === emailLower)) {
        throw new Error("Email already exists");
      }

      const newUser = {
        _id: "user_" + Math.random().toString(36).substring(2, 11),
        name: userData.name,
        email: emailLower,
        password: hashedPassword,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      users.push(newUser);
      saveUsers(users);

      const { password, ...userWithoutPassword } = newUser;
      return userWithoutPassword;
    }
  }
}
