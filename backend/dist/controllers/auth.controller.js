"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.me = me;
exports.logout = logout;
exports.verifyEmail = verifyEmail;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const client_1 = require("@prisma/client");
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_2 = require("@prisma/client");
const email_service_1 = require("../services/email.service");
async function register(req, res) {
    console.log("[register] started", { email: req.body?.email });
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required",
            });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const confirmToken = crypto_1.default.randomUUID();
        const user = await prisma_1.default.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                confirmToken,
            },
        });
        console.log("[register] user created", { userId: user.id, email: user.email });
        // Fire-and-forget: email failure must NEVER block or fail the registration response
        console.log("[register] email sending started", { userId: user.id });
        (0, email_service_1.sendVerificationEmail)(user.email, confirmToken).then((result) => {
            if (result.success) {
                console.log("[register] email sent success", { userId: user.id });
            }
            else {
                console.error("[register] email failed", { userId: user.id, error: result.error });
            }
        });
        return res.status(201).json({
            success: true,
            message: "Registration successful",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                status: user.status,
            },
        });
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002") {
            return res.status(409).json({
                success: false,
                message: "Email already exists",
            });
        }
        console.error("[register] unexpected error", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
}
async function login(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }
        const user = await prisma_1.default.user.findUnique({
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
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }
        if (user.status === client_2.Status.BLOCKED) {
            return res.status(403).json({
                success: false,
                message: "Your account is blocked",
            });
        }
        const expiresIn = (process.env.JWT_EXPIRES_IN ||
            "7d");
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, 
        // NOTE: expiry comes from env so it can be changed without code changes
        { expiresIn });
        await prisma_1.default.user.update({
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
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
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
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
}
async function me(req, res) {
    try {
        const userId = req.user.userId;
        const user = await prisma_1.default.user.findUnique({
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
            return res
                .status(401)
                .json({ success: false, message: "User not found" });
        }
        if (user.status === client_2.Status.BLOCKED) {
            return res
                .status(403)
                .json({ success: false, message: "Your account has been blocked" });
        }
        const { confirmToken, ...userFields } = user;
        return res.json({
            success: true,
            user: { ...userFields, isVerified: confirmToken === null },
        });
    }
    catch (error) {
        return res
            .status(500)
            .json({ success: false, message: "Internal Server Error" });
    }
}
async function logout(_req, res) {
    const isProduction = process.env.NODE_ENV === "production";
    res.clearCookie("token", {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
    });
    return res.json({ success: true, message: "Logged out successfully" });
}
async function verifyEmail(req, res) {
    try {
        const { token } = req.params;
        const confirmToken = Array.isArray(token) ? token[0] : token;
        const user = await prisma_1.default.user.findFirst({
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
        if (user.status === client_2.Status.BLOCKED) {
            return res.status(403).json({
                success: false,
                message: "Your account is blocked. Email verification is not possible. Contact an administrator.",
            });
        }
        await prisma_1.default.user.update({
            where: { id: user.id },
            data: {
                status: client_2.Status.ACTIVE,
                confirmToken: null,
            },
        });
        return res.json({
            success: true,
            message: "Email verified successfully! You can now sign in.",
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
}
