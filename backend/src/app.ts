import express from "express";
import cors from "cors";
import morgan from "morgan";
// import { PrismaClient } from "@prisma/client";
import "dotenv/config";
import authRoutes from "./routes/auth.routes";

// export const prisma = new PrismaClient();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", async (req, res) => {
  res.send("API working!");
});
app.use("/auth", authRoutes);


export default app;
