import { Request, Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../utils/prisma";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { hashPassword } from "../utils/bcrypt";

export const registerController = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new Error("User already exists");

    const hashed = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
      },
    });

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // save refresh token in DB
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return res.json({
      message: "User registered successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      accessToken,
      refreshToken,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 1. Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 3. Generate tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // 4. Save refresh token to DB (token rotation)
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    // 5. Send response
    return res.json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });

  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};


export const refreshTokenController = async (req: Request, res: Response) => {
  try {
    const token = req.body.refreshToken;

    if (!token) {
      return res.status(401).json({ message: "Refresh token is required" });
    }

    // 1️⃣ Verify refresh token validity
    const decoded = verifyRefreshToken(token);

    if (!decoded || !decoded.userId) {
      return res.status(403).json({ message: "Invalid or expired refresh token" });
    }

    // 2️⃣ Check if refresh token exists in DB
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || user.refreshToken !== token) {
      return res.status(403).json({ message: "Refresh token does not match" });
    }

    // 3️⃣ Generate new tokens
    const newAccessToken = generateAccessToken(user.id);
    const newRefreshToken = generateRefreshToken(user.id);

    // 4️⃣ Save new refresh token (rotate token)
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });

    return res.json({
      message: "Token refreshed successfully",
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });

  } catch (err) {
    console.error("Refresh Token Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const logoutController = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    if (!decoded || !decoded.userId) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    // Remove the refresh token from DB (invalidate)
    await prisma.user.update({
      where: { id: decoded.userId },
      data: { refreshToken: null },
    });

    return res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout Error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
