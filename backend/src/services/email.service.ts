import nodemailer from "nodemailer";

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const APP_BASE_URL = process.env.APP_BASE_URL;

if (!EMAIL_USER || !EMAIL_PASS || !APP_BASE_URL) {
  throw new Error(
    "Missing required env variables: EMAIL_USER, EMAIL_PASS, APP_BASE_URL"
  );
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

transporter.verify((error) => {
  if (error) {
    console.error("SMTP CONFIG ERROR:", error);
  } else {
    console.log("SMTP READY");
  }
});

async function sendWithRetry(
  mailOptions: nodemailer.SendMailOptions,
  retries = 3
): Promise<void> {
  for (let i = 1; i <= retries; i++) {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log("EMAIL SENT:", info.messageId);
      return;
    } catch (error) {
      console.error(`EMAIL ATTEMPT ${i} FAILED:`, error);

      if (i === retries) {
        throw error;
      }
    }
  }
}

export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<void> {
  const link = `${APP_BASE_URL}/verify/${token}`;

  const mailOptions = {
    from: EMAIL_USER,
    to: email,
    subject: "Verify your email address",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Welcome to User Management</h2>
        <p>Please verify your email address by clicking below:</p>

        <a href="${link}"
          style="
            display:inline-block;
            padding:12px 24px;
            background:#0d6efd;
            color:white;
            text-decoration:none;
            border-radius:6px;
            font-weight:bold;
          ">
          Verify Email
        </a>

        <p style="margin-top:20px; color:#666;">
          If you didn’t create this account, ignore this email.
        </p>
      </div>
    `,
  };

  await sendWithRetry(mailOptions);
}