import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 10000,
});

export async function sendVerificationEmail(
  email: string,
  token: string,
): Promise<void> {
  await transporter.verify();

  const link = `${process.env.APP_BASE_URL}/verify/${token}`;

  const info = await transporter.sendMail({
    from: `"User Management" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: "Verify your email",
    html: `
      <h2>Welcome to User Management</h2>
      <p>Please verify your email:</p>
      <a href="${link}">Verify Email</a>
    `,
  });

  console.log("Email sent:", info.messageId);
}