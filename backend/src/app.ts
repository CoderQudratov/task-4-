import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth";
import userRouter from "./routes/user";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use("/auth", authRouter);
app.use("/users", userRouter);
export default app;
