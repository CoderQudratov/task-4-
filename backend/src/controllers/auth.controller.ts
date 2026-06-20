import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { Prisma } from "@prisma/client";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { Status } from "@prisma/client";
import { sendVerificationEmail } from "../services/email.service";
import type { AuthRequest } from "../middleware/auth";
export async function register(req: Request, res: Response) {
  console.log("REGISTER IS CALLED");
  console.log(req.body);
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const confirmToken = crypto.randomUUID();
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        confirmToken,
      },
    });
    try {
      await sendVerificationEmail(user.email, confirmToken);
    } catch (err) {
      console.log("Email send error:", err);
    }
    return res.status(201).json({
      succsess: true,
      message: "Registration successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        status: user.status,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (user.status === Status.BLOCKED) {
      return res.status(403).json({
        success: false,
        message: "Your account is blocked",
      });
    }

    const expiresIn = (process.env.JWT_EXPIRES_IN || "7d") as jwt.SignOptions["expiresIn"];
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET as string,
      // NOTE: expiry comes from env so it can be changed without code changes
      { expiresIn },
    );

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        lastLogin: new Date(),
      },
    });

    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("token", token, {
      httpOnly: true,
      // IMPORTANT: secure must be true in production (HTTPS only).
      // With secure: false the browser rejects the cookie on HTTPS origins.
      secure: isProduction,
      // IMPORTANT: sameSite must be "none" for cross-origin (Vercel → Render).
      // "lax" blocks cross-site POST cookie delivery — the cookie is set but
      // never sent back on subsequent requests from a different origin.
      sameSite: isProduction ? "none" : "lax",
      // IMPORTANT: without maxAge the cookie is a session cookie and dies
      // when the tab closes. Give it the same lifetime as the JWT itself.
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    console.log(`[login] success — userId=${user.id} env=${process.env.NODE_ENV}`);

    return res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        status: user.status,
      },
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}
// NOTE: Called by ProtectedRoute on every protected page mount to validate the session.
// Returns the current user or 401/403 so the frontend knows what to do.
export async function me(req: AuthRequest, res: Response) {
  try {
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        confirmToken: true,
        lastLogin: true,
        createdAt: true,
      },
    });

    // IMPORTANT: User could have been deleted after the JWT was issued
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    // IMPORTANT: Blocked users must not be allowed through — return 403
    if (user.status === Status.BLOCKED) {
      return res.status(403).json({ success: false, message: "Your account has been blocked" });
    }

    // NOTE: confirmToken === null means the user verified their email
    const { confirmToken, ...userFields } = user;

    return res.json({
      success: true,
      user: { ...userFields, isVerified: confirmToken === null },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

// NOTE: Clears the httpOnly cookie. Frontend also clears localStorage.
export async function logout(_req: Request, res: Response) {
  const isProduction = process.env.NODE_ENV === "production";
  // IMPORTANT: clearCookie options must exactly match the set options,
  // otherwise the browser treats them as different cookies and ignores the clear.
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });

  return res.json({ success: true, message: "Logged out successfully" });
}

export async function verifyEmail(req: Request, res: Response) {
  try {
    const { token } = req.params;

    const confirmToken = Array.isArray(token) ? token[0] : token;
    const user = await prisma.user.findFirst({
      where: { confirmToken },
    });

    // IMPORTANT: Token not found means invalid or already used (cleared on verify)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Invalid or expired verification link. If you already verified your email, try signing in.",
      });
    }

    // IMPORTANT: Blocked users must NOT be activated through email verification.
    // An admin must unblock them first.
    if (user.status === Status.BLOCKED) {
      return res.status(403).json({
        success: false,
        message: "Your account is blocked. Email verification is not possible. Contact an administrator.",
      });
    }

    // NOTE: Only UNVERIFIED users can be activated. Activate and clear the token.
    await prisma.user.update({
      where: { id: user.id },
      data: {
        status: Status.ACTIVE,
        confirmToken: null,
      },
    });

    return res.json({
      success: true,
      message: "Email verified successfully! You can now sign in.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}
