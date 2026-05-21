import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "chuanmingtang_dev_secret_2024";
const JWT_EXPIRES_IN = "7d";

export interface JwtPayload {
  userId: string;
  phone: string;
}

/** 生成 JWT Token */
export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/** 验证 JWT Token，返回 payload 或 null */
export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

/** 从请求头中提取并验证 Token */
export function getUserFromRequest(request: NextRequest): JwtPayload | null {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  return verifyToken(token);
}
