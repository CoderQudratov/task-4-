import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendVerificationEmail(
  email: string,
  token: string,
): Promise<void> {
  const link = `${process.env.APP_BASE_URL}/verify/${token}`;

  await transporter.sendMail({
    from: `"User Management" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: "Verify your email address",
    html: `
      <h2>Welcome to User Management</h2>
      <p>Click the button below to verify your email address:</p>
      <a href="${link}"
         style="display:inline-block;padding:10px 20px;background:#0d6efd;color:white;text-decoration:none;border-radius:4px;">
        Verify Email
      </a>
      <p style="margin-top:16px;color:#666;font-size:14px;">
        If you did not create an account, you can safely ignore this email.
      </p>
    `,
  });
}
