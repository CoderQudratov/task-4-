import "dotenv/config";
import app from "./app";

const REQUIRED_ENV = [
  "EMAIL_USER",
  "EMAIL_PASS",
  "EMAIL_FROM",
  "APP_BASE_URL",
  "JWT_SECRET",
  "DATABASE_URL",
] as const;

const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`[startup] Missing required env variables: ${missing.join(", ")}`);
  process.exit(1);
}

const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
  console.log(`SERVER STARTED ON ${port}`);
});
