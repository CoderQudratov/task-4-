import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: any;
}

export function auth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const token = req.cookies.token;

    // Defensive log: helps diagnose cookie delivery failures in production.
    // If this prints "no token" after login, the cookie is not being sent —
    // check sameSite/secure options and CORS credentials.
    console.log(`[auth] ${req.method} ${req.path} — cookie present: ${!!token}`);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

    req.user = decoded;

    next();
  } catch (error) {
    console.error(`[auth] JWT verification failed:`, (error as Error).message);
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
}
