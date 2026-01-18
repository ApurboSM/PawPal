import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Extend Express Request type to include jwtUser.
// NOTE: do NOT override `req.user` (Passport uses that and has its own typings).
declare global {
  namespace Express {
    interface Request {
      jwtUser?: {
        userId: number;
        role: string;
      };
    }
  }
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const user = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    ) as {
      userId: number;
      role: string;
    };

    req.jwtUser = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.jwtUser?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}; 