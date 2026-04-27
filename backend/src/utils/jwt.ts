import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from './prisma';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const REFRESH_EXPIRES_IN_DAYS = 7;

export interface JWTPayload {
  userId: string;
  email: string;
}

export function signAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): JWTPayload {
  return jwt.verify(token, ACCESS_SECRET) as JWTPayload;
}

export async function createRefreshToken(userId: string): Promise<string> {
  const token = uuidv4();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_EXPIRES_IN_DAYS);

  await prisma.refreshToken.create({
    data: { token, userId, expiresAt },
  });

  return token;
}

export async function rotateRefreshToken(
  oldToken: string
): Promise<{ accessToken: string; refreshToken: string; userId: string } | null> {
  const existing = await prisma.refreshToken.findUnique({
    where: { token: oldToken },
    include: { user: true },
  });

  if (!existing || existing.expiresAt < new Date()) {
    // Expired or not found — delete if exists
    if (existing) {
      await prisma.refreshToken.delete({ where: { token: oldToken } });
    }
    return null;
  }

  // Rotate: delete old, issue new
  await prisma.refreshToken.delete({ where: { token: oldToken } });

  const newRefreshToken = await createRefreshToken(existing.userId);
  const accessToken = signAccessToken({
    userId: existing.userId,
    email: existing.user.email,
  });

  return { accessToken, refreshToken: newRefreshToken, userId: existing.userId };
}

export async function revokeRefreshToken(token: string): Promise<void> {
  await prisma.refreshToken.deleteMany({ where: { token } });
}
