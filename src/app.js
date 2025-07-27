import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

// Create express app
const app = express();

// Cookie Parser first
app.use(cookieParser());

// CORS last before routes
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

// JSON + Form parsers
app.use(express.json({ limit: process.env.LIMIT_JSON || "5mb" }));
app.use(express.urlencoded({ extended: true, limit: process.env.LIMIT_JSON }));

// Static files (before routes)
app.get("/", (_, res) => {
  res.json({ message: "API working 🎉" });
});

app.use(express.static("public"));



// routes
import userRouter from "./routes/user.routes.js"
import authRouter from "./routes/auth.routes.js";
import { errorHandler } from "./utils/apiHandler.js";


// routes delecration 
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users" ,userRouter)


app.use(errorHandler); 
export default app;
