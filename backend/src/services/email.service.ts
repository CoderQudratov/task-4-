import { Resend } from "resend";

// Resend uses HTTPS (port 443) — no SMTP, no IPv6 socket issues on Render.
// Gmail SMTP was failing with ENETUNREACH on IPv6 addresses.
// Lazy singleton: defers construction until first use so that RESEND_API_KEY
// can be set via env after module load (tests, dotenv, etc.).
let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY env var is not set");
    _resend = new Resend(key);
  }
  return _resend;
}

export interface EmailResult {
  success: boolean;
  error?: string;
}

async function attemptSend(email: string, token: string): Promise<void> {
  const link = `${process.env.APP_BASE_URL}/verify/${token}`;
  const from = process.env.EMAIL_FROM ?? "noreply@example.com";

  const { error } = await getResend().emails.send({
    from: `User Management <${from}>`,
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

  if (error) {
    throw new Error(error.message);
  }
}

export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<EmailResult> {
  const MAX_RETRIES = 3;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await attemptSend(email, token);

      console.log(
        `[email] sent successfully to=${email} attempt=${attempt}`
      );

      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);

      console.error(
        `[email] Resend error to=${email} attempt=${attempt}/${MAX_RETRIES} error="${message}"`
      );

      if (attempt < MAX_RETRIES) {
        const delay = 1000 * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        return { success: false, error: message };
      }
    }
  }

  return { success: false, error: "Unknown error" };
}
