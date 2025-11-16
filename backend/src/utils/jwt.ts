// import jwt from "jsonwebtoken";

// export const generateAccessToken = (userId: string) => {
//   return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET!, {
//     expiresIn: "15m",
//   });
// };

// export const generateRefreshToken = (userId: string) => {
//   return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET!, {
//     expiresIn: "7d",
//   });
// };

// export const generateToken = (userId: string) => {
//   return jwt.sign({ userId }, process.env.JWT_SECRET!, {
//     expiresIn: "7d",
//   });
// };

import jwt, { JwtPayload } from "jsonwebtoken";

// ------------ TOKEN GENERATORS -------------

export const generateAccessToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET!, {
    expiresIn: "15m", // short-lived
  });
};

export const generateRefreshToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET!, {
    expiresIn: "7d", // long-lived
  });
};

// ------------ TOKEN VERIFIERS -------------

export const verifyAccessToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as JwtPayload;
  } catch {
    return null;
  }
};

export const verifyRefreshToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!) as JwtPayload;
  } catch {
    return null;
  }
};
