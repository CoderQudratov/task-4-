"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_1 = __importDefault(require("./routes/auth"));
const user_1 = __importDefault(require("./routes/user"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    // NOTE: Use CLIENT_URL env so the allowed origin is never hardcoded
    origin: process.env.CLIENT_URL,
    credentials: true,
}));
app.use((0, cookie_parser_1.default)());
app.use("/auth", auth_1.default);
app.use("/users", user_1.default);
exports.default = app;
