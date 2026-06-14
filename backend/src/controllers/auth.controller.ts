import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import prisma from "../../prisma/lib/prisma";
import { Prisma } from "@prisma/client";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { Status } from "@prisma/client";
import { sendVerificationEmail } from "../services/email.service";
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

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

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

    const token = jwt.sign(
      {
        userId: user.id,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "7d",
      }
    );

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        lastLogin: new Date(),
      },
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

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
export async function verifyEmail(
  req: Request,
  res: Response
) {
  try {
    const token = req.params.token as string;

    const user = await prisma.user.findFirst({
      where: {
        confirmToken: token,
      },
    });

    if (!user) {
      return res.status(404).send("Invalid token");
    }

    if (user.status !== Status.BLOCKED) {
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          status: Status.ACTIVE,
          confirmToken: null,
        },
      });
    }

    return res.send("Email verified successfully");
  } catch (error) {
    console.log(error);

    return res.status(500).send("Internal Server Error");
  }
}