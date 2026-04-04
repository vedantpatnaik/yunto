import api from "./client";
import {
  AuthResponse,
  LoginRequest,
  OtpSendRequest,
  OtpVerifyRequest,
  UserDTO,
  ApiResponse,
} from "@yunto/shared";

export async function loginApi(data: LoginRequest): Promise<AuthResponse> {
  const res = await api.post<ApiResponse<AuthResponse>>("/auth/login", data);
  return res.data.data;
}

export async function otpSendApi(data: OtpSendRequest): Promise<void> {
  await api.post("/auth/otp/send", data);
}

export async function otpVerifyApi(
  data: OtpVerifyRequest
): Promise<AuthResponse> {
  const res = await api.post<ApiResponse<AuthResponse>>(
    "/auth/otp/verify",
    data
  );
  return res.data.data;
}

export async function getMeApi(): Promise<UserDTO> {
  const res = await api.get<ApiResponse<UserDTO>>("/auth/me");
  return res.data.data;
}
