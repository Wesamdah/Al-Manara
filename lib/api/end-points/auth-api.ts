import { apiClient } from "../api-client";

type LoginPayload = {
  email: string;
  password: string;
};

type LoginResponse = {
  token: string;

  admin: {
    id: string;
    email: string;
    role: string;
  };
};

export async function loginApi(payload: LoginPayload) {
  return apiClient<LoginResponse>("/api/admin/auth/login", {
    method: "POST",
    body: payload,
  });
}

type ForgotPasswordPayload = {
  email: string;
};

export async function forgotPasswordApi(payload: ForgotPasswordPayload) {
  return apiClient<{
    success: boolean;
    message: string;
  }>("/api/admin/auth/forgot-password", {
    method: "POST",
    body: payload,
  });
}

type ResetPasswordPayload = {
  email: string;

  otp: string;

  newPassword: string;

  confirmNewPassword: string;
};

export async function resetPasswordApi(payload: ResetPasswordPayload) {
  return apiClient<{
    success: boolean;
    message: string;
  }>("/api/admin/auth/reset-password", {
    method: "POST",
    body: payload,
  });
}
