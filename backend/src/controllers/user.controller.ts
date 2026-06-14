import { Request, Response } from "express";
import prisma from "../../prisma/lib/prisma";

export async function getUsers(req: Request, res: Response) {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        lastLogin: true,
        createdAt: true,
      },
    });

    return res.json({
      success: true,
      users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}
export async function blockUsers(req: Request, res: Response) {
  try {
    const { ids } = req.body;

    await prisma.user.updateMany({
      where: {
        id: {
          in: ids,
        },
      },
      data: {
        status: "BLOCKED",
      },
    });

    return res.json({
      success: true,
      message: "Users blocked",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}
export async function unblockUsers(req: Request, res: Response) {
  try {
    const { ids } = req.body;

    await prisma.user.updateMany({
      where: {
        id: {
          in: ids,
        },
      },
      data: {
        status: "ACTIVE",
      },
    });

    return res.json({
      success: true,
      message: "Users unblocked",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

export async function deleteUsers(req: Request, res: Response) {
  try {
    const { ids } = req.body;

    await prisma.user.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return res.json({
      success: true,
      message: "Users deleted",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}
export async function deleteUnverifiedUsers(
  req: Request,
  res: Response
) {
  try {
    await prisma.user.deleteMany({
      where: {
        status: "UNVERIFIED",
      },
    });

    return res.json({
      success: true,
      message: "Unverified users deleted",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}