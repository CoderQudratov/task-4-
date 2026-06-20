"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendVerificationEmail = sendVerificationEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dns_1 = __importDefault(require("dns"));
dns_1.default.setDefaultResultOrder("ipv4first");
const transporter = nodemailer_1.default.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
});
async function attemptSend(email, token) {
    const link = `${process.env.APP_BASE_URL}/verify/${token}`;
    await transporter.sendMail({
        from: `"User Management" <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: "Verify your email",
        html: `
      <h2>Welcome to User Management</h2>
      <p>Please verify your email:</p>
      <a href="${link}"
         style="
           display:inline-block;
           padding:10px 20px;
           background:#0d6efd;
           color:white;
           text-decoration:none;
           border-radius:4px;
         ">
         Verify Email
      </a>
    `,
    });
}
async function sendVerificationEmail(email, token) {
    const MAX_RETRIES = 3;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            await attemptSend(email, token);
            console.log(`[email] sent successfully to=${email} attempt=${attempt}`);
            return { success: true };
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            console.error(`[email] SMTP error to=${email} attempt=${attempt}/${MAX_RETRIES} error="${message}"`);
            if (attempt < MAX_RETRIES) {
                const delay = 1000 * Math.pow(2, attempt - 1);
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
            else {
                return {
                    success: false,
                    error: message,
                };
            }
        }
    }
    return {
        success: false,
        error: "Unknown error",
    };
}
