import { z } from "zod";

type ValidationMessages = {
  invalidEmail: string;

  passwordMin: string;

  otpLength: string;

  confirmPasswordRequired: string;

  passwordsNotMatch: string;
};

export function createAuthValidationSchemas(messages: ValidationMessages) {
  const loginClientSchema = z.object({
    email: z.email(messages.invalidEmail),

    password: z.string().min(8, messages.passwordMin),
  });

  const forgotPasswordClientSchema = z.object({
    email: z.email(messages.invalidEmail),
  });

  const resetPasswordClientSchema = z
    .object({
      otp: z.string().trim().length(6, messages.otpLength),

      newPassword: z.string().min(8, messages.passwordMin),

      confirmNewPassword: z.string().min(8, messages.confirmPasswordRequired),
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
      path: ["confirmNewPassword"],
      message: messages.passwordsNotMatch,
    });

  return {
    loginClientSchema,

    forgotPasswordClientSchema,

    resetPasswordClientSchema,
  };
}

export type LoginClientSchema = z.infer<
  ReturnType<typeof createAuthValidationSchemas>["loginClientSchema"]
>;

export type ForgotPasswordClientSchema = z.infer<
  ReturnType<typeof createAuthValidationSchemas>["forgotPasswordClientSchema"]
>;

export type ResetPasswordClientSchema = z.infer<
  ReturnType<typeof createAuthValidationSchemas>["resetPasswordClientSchema"]
>;
