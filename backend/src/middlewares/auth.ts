import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
    }
  }
}

export const auth = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = header.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const decoded = verifyAccessToken(token);

  if (!decoded || !decoded.userId) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  req.user = { id: decoded.userId };
  next();
};
