import { prisma } from "../../config/database";
import { redis } from "../../config/redis";
import { comparePassword } from "../../utils/hash";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt";
import { AppError } from "../../middleware/error-handler";
import { AuthResponse, TokenPayload, UserDTO } from "@yunto/shared";
import { User, Agency } from "@prisma/client";

type UserWithAgency = User & { agency: Agency };

function toUserDTO(user: UserWithAgency): UserDTO {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    name: user.name,
    avatar: user.avatar,
    role: user.role,
    department: user.department,
    agency: {
      id: user.agency.id,
      name: user.agency.name,
      code: user.agency.code,
      logo: user.agency.logo,
    },
  };
}

function generateTokens(user: UserWithAgency): {
  accessToken: string;
  refreshToken: string;
} {
  const payload: TokenPayload = {
    userId: user.id,
    agencyId: user.agencyId,
    role: user.role,
  };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken({ userId: user.id });
  return { accessToken, refreshToken };
}

export async function loginWithEmail(
  email: string,
  password: string,
  agencyCode: string
): Promise<AuthResponse> {
  const agency = await prisma.agency.findUnique({
    where: { code: agencyCode },
  });
  if (!agency) {
    throw new AppError(401, "Invalid agency code");
  }

  const user = await prisma.user.findUnique({
    where: { agencyId_email: { agencyId: agency.id, email } },
    include: { agency: true },
  });
  if (!user || !user.passwordHash) {
    throw new AppError(401, "Invalid email or password");
  }
  if (!user.isActive) {
    throw new AppError(403, "Account is deactivated");
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    throw new AppError(401, "Invalid email or password");
  }

  const { accessToken, refreshToken } = generateTokens(user);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  return { accessToken, refreshToken, user: toUserDTO(user) };
}

export async function sendOtp(phone: string): Promise<void> {
  const user = await prisma.user.findFirst({ where: { phone } });
  if (!user) {
    throw new AppError(404, "No account found with this phone number");
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await prisma.otpCode.create({
    data: { phone, code, expiresAt },
  });

  if (process.env.NODE_ENV === "development" || !process.env.MSG91_AUTH_KEY) {
    console.log(`[DEV OTP] Phone: ${phone}, Code: ${code}`);
    return;
  }
}

export async function verifyOtp(
  phone: string,
  code: string
): Promise<AuthResponse> {
  const otp = await prisma.otpCode.findFirst({
    where: {
      phone,
      code,
      verified: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) {
    throw new AppError(401, "Invalid or expired OTP");
  }

  await prisma.otpCode.update({
    where: { id: otp.id },
    data: { verified: true },
  });

  const user = await prisma.user.findFirst({
    where: { phone },
    include: { agency: true },
  });
  if (!user) {
    throw new AppError(404, "No account found with this phone number");
  }
  if (!user.isActive) {
    throw new AppError(403, "Account is deactivated");
  }

  const { accessToken, refreshToken } = generateTokens(user);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  return { accessToken, refreshToken, user: toUserDTO(user) };
}

export async function refreshTokens(
  oldRefreshToken: string
): Promise<{ accessToken: string; refreshToken: string }> {
  let payload: { userId: string };
  try {
    payload = verifyRefreshToken(oldRefreshToken);
  } catch {
    throw new AppError(401, "Invalid refresh token");
  }

  const stored = await prisma.refreshToken.findUnique({
    where: { token: oldRefreshToken },
  });
  if (!stored || stored.expiresAt < new Date()) {
    throw new AppError(401, "Refresh token expired or revoked");
  }

  await prisma.refreshToken.delete({ where: { id: stored.id } });

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: { agency: true },
  });
  if (!user || !user.isActive) {
    throw new AppError(401, "User not found or deactivated");
  }

  const tokens = generateTokens(user);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: tokens.refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return tokens;
}

export async function logout(refreshToken: string): Promise<void> {
  await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
}

export async function getMe(userId: string): Promise<UserDTO> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { agency: true },
  });
  if (!user) {
    throw new AppError(404, "User not found");
  }
  return toUserDTO(user);
}
