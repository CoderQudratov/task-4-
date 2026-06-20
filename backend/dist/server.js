"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = __importDefault(require("./app"));
const REQUIRED_ENV = [
    "EMAIL_USER",
    "EMAIL_PASS",
    "EMAIL_FROM",
    "APP_BASE_URL",
    "JWT_SECRET",
    "DATABASE_URL",
];
const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missing.length > 0) {
    console.error(`[startup] Missing required env variables: ${missing.join(", ")}`);
    process.exit(1);
}
const port = Number(process.env.PORT) || 3000;
app_1.default.listen(port, () => {
    console.log(`SERVER STARTED ON ${port}`);
});
