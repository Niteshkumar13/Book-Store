import { Request, Response } from "express";
import fs from "fs-extra";
import path from "path";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

interface User {
  id: string;
  email: string;
  password: string;
}

const usersFile = path.join(__dirname, "../../data/users.json");
const SECRET = process.env.JWT_SECRET || "your_secret_key";

// In-memory user map: email -> User
const userMap = new Map<string, User>();

// Load users at startup
(async () => {
  const users: User[] = await fs.readJson(usersFile).catch(() => []);
  users.forEach((u) => userMap.set(u.email, u));
})();

// Save userMap to file
async function persistUsersToFile() {
  await fs.writeJson(usersFile, Array.from(userMap.values()));
}

export class AuthController {
  // POST /register
  static async register(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
      }

      if (userMap.has(email)) {
        return res.status(409).json({ error: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser: User = {
        id: Date.now().toString(),
        email,
        password: hashedPassword,
      };

      userMap.set(email, newUser);
      await persistUsersToFile();

      const token = jwt.sign(
        { id: newUser.id, email: newUser.email },
        SECRET,
        { expiresIn: "1h" }
      );

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: true,
        maxAge: 3600000,
      });

      return res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: { id: newUser.id, email: newUser.email },
      });
    } catch (error) {
      console.error("Register error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  // POST /login
  static async login(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
      }

      const user = userMap.get(email);

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email },
        SECRET,
        { expiresIn: "1h" }
      );

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: true,
        maxAge: 3600000,
      });

      return res.status(200).json({
        success: true,
        message: "Login successful",
        user: { id: user.id, email: user.email },
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}
