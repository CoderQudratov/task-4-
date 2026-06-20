"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = auth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function auth(req, res, next) {
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
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        console.error(`[auth] JWT verification failed:`, error.message);
        return res.status(401).json({
            success: false,
            message: "Invalid token",
        });
    }
}
