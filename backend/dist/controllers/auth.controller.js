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
    console.log("REGISTER IS CALLED");
    console.log(req.body);
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
        try {
            await (0, email_service_1.sendVerificationEmail)(user.email, confirmToken);
        }
        catch (err) {
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
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002") {
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
        const expiresIn = (process.env.JWT_EXPIRES_IN || "7d");
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
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
}
// NOTE: Called by ProtectedRoute on every protected page mount to validate the session.
// Returns the current user or 401/403 so the frontend knows what to do.
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
            return res.status(401).json({ success: false, message: "User not found" });
        }
        // IMPORTANT: Blocked users must not be allowed through — return 403
        if (user.status === client_2.Status.BLOCKED) {
            return res.status(403).json({ success: false, message: "Your account has been blocked" });
        }
        // NOTE: confirmToken === null means the user verified their email
        const { confirmToken, ...userFields } = user;
        return res.json({
            success: true,
            user: { ...userFields, isVerified: confirmToken === null },
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}
// NOTE: Clears the httpOnly cookie. Frontend also clears localStorage.
async function logout(req, res) {
    res.clearCookie("token", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
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
        // NOTE: Only UNVERIFIED users can be activated. Activate and clear the token.
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
