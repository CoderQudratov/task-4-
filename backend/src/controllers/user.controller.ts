import { Request, Response } from "express";
import prisma from "../../prisma/lib/prisma";

export async function getUsers(req: Request, res: Response) {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        // NOTE: confirmToken needed to compute isVerified — not exposed in response
        confirmToken: true,
        lastLogin: true,
        createdAt: true,
      },
    });

    // Strip confirmToken from response and compute isVerified
    const result = users.map(({ confirmToken, ...user }) => ({
      ...user,
      isVerified: confirmToken === null,
    }));

    return res.json({ success: true, users: result });
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

    // IMPORTANT: Save each user's current status into previousStatus before blocking.
    // This allows unblock to restore the exact status (ACTIVE or UNVERIFIED).
    const users = await prisma.user.findMany({
      where: { id: { in: ids } },
      select: { id: true, status: true },
    });

    await Promise.all(
      users.map((user) =>
        prisma.user.update({
          where: { id: user.id },
          data: {
            previousStatus: user.status,
            status: "BLOCKED",
          },
        })
      )
    );

    return res.json({ success: true, message: "Users blocked" });
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

    // NOTE: Read previousStatus to restore what the user was before being blocked.
    // Falls back to ACTIVE if previousStatus was never saved (e.g. old records).
    const users = await prisma.user.findMany({
      where: { id: { in: ids } },
      select: { id: true, previousStatus: true },
    });

    await Promise.all(
      users.map((user) =>
        prisma.user.update({
          where: { id: user.id },
          data: {
            status: user.previousStatus ?? "ACTIVE",
            previousStatus: null, // Clear after restoring
          },
        })
      )
    );

    return res.json({ success: true, message: "Users unblocked" });
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
export async function deleteUnverifiedUsers(req: Request, res: Response) {
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
