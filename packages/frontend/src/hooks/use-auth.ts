import { useMutation } from "@tanstack/react-query";
import { loginApi, otpSendApi, otpVerifyApi } from "@/api/auth.api";
import { useAuthStore } from "@/stores/auth.store";
import { useNavigate } from "react-router-dom";
import { LoginRequest, OtpVerifyRequest } from "@yunto/shared";

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: LoginRequest) => loginApi(data),
    onSuccess: (result) => {
      setAuth(result.user, result.accessToken, result.refreshToken);
      navigate("/dashboard");
    },
  });
}

export function useOtpSend() {
  return useMutation({
    mutationFn: (data: { phone: string }) => otpSendApi(data),
  });
}

export function useOtpVerify() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: OtpVerifyRequest) => otpVerifyApi(data),
    onSuccess: (result) => {
      setAuth(result.user, result.accessToken, result.refreshToken);
      navigate("/dashboard");
    },
  });
}
