"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = getUsers;
exports.blockUsers = blockUsers;
exports.unblockUsers = unblockUsers;
exports.deleteUsers = deleteUsers;
exports.deleteUnverifiedUsers = deleteUnverifiedUsers;
const prisma_1 = __importDefault(require("../lib/prisma"));
async function getUsers(req, res) {
    try {
        const users = await prisma_1.default.user.findMany({
            orderBy: { createdAt: "desc" },
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
        const result = users.map(({ confirmToken, ...user }) => ({
            ...user,
            isVerified: confirmToken === null,
        }));
        return res.json({ success: true, users: result });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
}
async function blockUsers(req, res) {
    try {
        const { ids } = req.body;
        const users = await prisma_1.default.user.findMany({
            where: { id: { in: ids } },
            select: { id: true, status: true },
        });
        await Promise.all(users.map((user) => prisma_1.default.user.update({
            where: { id: user.id },
            data: {
                previousStatus: user.status,
                status: "BLOCKED",
            },
        })));
        return res.json({ success: true, message: "Users blocked" });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
}
async function unblockUsers(req, res) {
    try {
        const { ids } = req.body;
        const users = await prisma_1.default.user.findMany({
            where: { id: { in: ids } },
            select: { id: true, previousStatus: true },
        });
        await Promise.all(users.map((user) => prisma_1.default.user.update({
            where: { id: user.id },
            data: {
                status: user.previousStatus ?? "ACTIVE",
                previousStatus: null, // Clear after restoring
            },
        })));
        return res.json({ success: true, message: "Users unblocked" });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
}
async function deleteUsers(req, res) {
    try {
        const { ids } = req.body;
        await prisma_1.default.user.deleteMany({
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
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
}
async function deleteUnverifiedUsers(req, res) {
    try {
        await prisma_1.default.user.deleteMany({
            where: {
                status: "UNVERIFIED",
            },
        });
        return res.json({
            success: true,
            message: "Unverified users deleted",
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
}
