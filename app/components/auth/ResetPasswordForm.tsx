"use client";

import { KeyRound, Lock } from "lucide-react";

import { PremiumButton } from "../ui/PremiumButton";
import { PremiumInput } from "../ui/PremiumInput";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  createAuthValidationSchemas,
  type ResetPasswordClientSchema,
} from "@/lib/validations/auth-client";

type ResetPasswordFormProps = {
  dict: {
    auth: {
      resetTitle: string;
      resetDescription: string;

      otp: string;
      otpPlaceholder: string;

      newPassword: string;
      confirmPassword: string;

      passwordPlaceholder: string;

      resetButton: string;
    };
    validation: {
      invalidEmail: string;
      passwordMin: string;
      otpLength: string;
      confirmPasswordRequired: string;
      passwordsNotMatch: string;
    };
  };
};

export function ResetPasswordForm({
  dict,
  locale,
}: ResetPasswordFormProps & { locale: "en" | "ar" }) {
  const { resetPasswordClientSchema } = createAuthValidationSchemas(
    dict.validation,
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordClientSchema>({
    resolver: zodResolver(resetPasswordClientSchema),
    defaultValues: {
      otp: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  async function onSubmit(data: ResetPasswordClientSchema) {
    console.log("Reset Password Data:", data);
  }

  return (
    <div>
      <div className="mb-8 text-center">
        <h2 className="display-font text-2xl font-bold tracking-[-0.02em] text-[var(--on-surface)]">
          {dict.auth.resetTitle}
        </h2>

        <p className="mt-3 text-sm leading-6 text-[var(--on-surface-variant)]">
          {dict.auth.resetDescription}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <PremiumInput
          label={dict.auth.otp}
          placeholder={dict.auth.otpPlaceholder}
          icon={KeyRound}
          error={errors.otp?.message}
          disabled={isSubmitting}
          {...register("otp")}
        />

        <PremiumInput
          label={dict.auth.newPassword}
          type="password"
          placeholder={dict.auth.passwordPlaceholder}
          icon={Lock}
          error={errors.newPassword?.message}
          disabled={isSubmitting}
          locale={locale}
          {...register("newPassword")}
        />

        <PremiumInput
          label={dict.auth.confirmPassword}
          type="password"
          placeholder={dict.auth.passwordPlaceholder}
          icon={Lock}
          error={errors.confirmNewPassword?.message}
          disabled={isSubmitting}
          locale={locale}
          {...register("confirmNewPassword")}
        />

        <PremiumButton type="submit">
          {isSubmitting ? "Loading..." : dict.auth.resetButton}
        </PremiumButton>
      </form>
    </div>
  );
}
