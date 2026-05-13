"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Mail } from "lucide-react";

import { PremiumInput } from "../ui/PremiumInput";
import { PremiumButton } from "../ui/PremiumButton";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  createAuthValidationSchemas,
  type ForgotPasswordClientSchema,
} from "@/lib/validations/auth-client";

type ForgetPasswordFormProps = {
  dict: {
    auth: {
      email: string;
      emailPlaceholder: string;
      forgotTitle: string;
      forgotDescription: string;
      sendOtpButton: string;
      backToLogin: string;
    };
    validation: {
      invalidEmail: string;
      passwordMin: string;
      otpLength: string;
      confirmPasswordRequired: string;
      passwordsNotMatch: string;
    };
  };
  locale: "en" | "ar";
};

export function ForgotPasswordForm({ dict, locale }: ForgetPasswordFormProps) {
  const isArabic = locale === "ar";
  const ArrowIcon = isArabic ? ArrowRight : ArrowLeft;

  const { forgotPasswordClientSchema } = createAuthValidationSchemas(
    dict.validation,
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordClientSchema>({
    resolver: zodResolver(forgotPasswordClientSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: ForgotPasswordClientSchema) {
    console.log("Forgot Password Data:", data);
  }

  return (
    <div>
      <div className="mb-8 text-center">
        <h2 className="display-font text-2xl font-bold tracking-[-0.02em] text-[var(--on-surface)]">
          {dict.auth.forgotTitle}
        </h2>
        <p className="mt-3 text-sm leading-6 text-[var(--on-surface-variant)]">
          {dict.auth.forgotDescription}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <PremiumInput
          label={dict.auth.email}
          type="email"
          placeholder={dict.auth.emailPlaceholder}
          icon={Mail}
          error={errors.email?.message}
          disabled={isSubmitting}
          {...register("email")}
        />

        <PremiumButton type="submit">
          {isSubmitting ? "Loading..." : dict.auth.sendOtpButton}
        </PremiumButton>
      </form>

      <Link
        href={`/${locale}/admin/login`}
        className="mt-6 flex items-center justify-center gap-2 text-sm text-[var(--secondary)] underline-offset-4 hover:text-[var(--primary)] hover:underline"
      >
        <ArrowIcon className="h-4 w-4" />
        {dict.auth.backToLogin}
      </Link>
    </div>
  );
}
