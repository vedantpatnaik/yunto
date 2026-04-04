import { Router } from "express";
import { validate } from "../../middleware/validate";
import { authMiddleware } from "../../middleware/auth";
import {
  loginSchema,
  otpSendSchema,
  otpVerifySchema,
  refreshSchema,
} from "@yunto/shared";
import * as authController from "./auth.controller";

const router = Router();

router.post("/login", validate(loginSchema), authController.login);
router.post("/otp/send", validate(otpSendSchema), authController.otpSend);
router.post("/otp/verify", validate(otpVerifySchema), authController.otpVerify);
router.post("/refresh", validate(refreshSchema), authController.refresh);
router.post("/logout", authController.logoutHandler);
router.get("/me", authMiddleware, authController.me);

export default router;
