import { Request, Response, NextFunction } from "express";
import * as authService from "./auth.service";

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password, agencyCode } = req.body;
    const result = await authService.loginWithEmail(email, password, agencyCode);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function otpSend(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await authService.sendOtp(req.body.phone);
    res.json({ data: { message: "OTP sent successfully" } });
  } catch (err) {
    next(err);
  }
}

export async function otpVerify(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { phone, code } = req.body;
    const result = await authService.verifyOtp(phone, code);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function refresh(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { refreshToken } = req.body;
    const tokens = await authService.refreshTokens(refreshToken);
    res.json({ data: tokens });
  } catch (err) {
    next(err);
  }
}

export async function logoutHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken);
    res.json({ data: { message: "Logged out successfully" } });
  } catch (err) {
    next(err);
  }
}

export async function me(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await authService.getMe(req.user!.userId);
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
}
