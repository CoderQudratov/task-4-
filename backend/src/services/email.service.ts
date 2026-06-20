import nodemailer from "nodemailer";

// Singleton transporter — created once at module load, never per-request
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 10_000,  // 10s to establish TCP connection
  greetingTimeout: 10_000,    // 10s to receive SMTP greeting
  socketTimeout: 15_000,      // 15s of inactivity before socket is killed
});

export interface EmailResult {
  success: boolean;
  error?: string;
}

async function attemptSend(
  email: string,
  token: string,
): Promise<void> {
  const link = `${process.env.APP_BASE_URL}/verify/${token}`;

  await transporter.sendMail({
    from: `"User Management" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: "Verify your email",
    html: `
      <h2>Welcome to User Management</h2>
      <p>Please verify your email:</p>
      <a href="${link}">Verify Email</a>
    `,
  });
}

/**
 * Sends a verification email with up to 3 attempts and exponential backoff.
 * Never throws — always returns a structured result.
 */
export async function sendVerificationEmail(
  email: string,
  token: string,
): Promise<EmailResult> {
  const MAX_RETRIES = 3;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await attemptSend(email, token);
      console.log(`[email] sent successfully to=${email} attempt=${attempt}`);
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(
        `[email] SMTP error to=${email} attempt=${attempt}/${MAX_RETRIES} error="${message}"`,
      );

      if (attempt < MAX_RETRIES) {
        // Exponential backoff: 1s, 2s, 4s …
        const delay = 1000 * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        return { success: false, error: message };
      }
    }
  }

  // Unreachable, but satisfies TypeScript
  return { success: false, error: "Unknown error" };
}
