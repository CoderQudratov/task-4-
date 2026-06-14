import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import prisma from "../../prisma/lib/prisma";
import { Prisma } from "@prisma/client";
import crypto from "crypto";
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
