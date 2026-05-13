"use client";

import Link from "next/link";
import { Mail, Lock } from "lucide-react";

import { PremiumInput } from "../ui/PremiumInput";
import { PremiumButton } from "../ui/PremiumButton";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  createAuthValidationSchemas,
  LoginClientSchema,
} from "@/lib/validations/auth-client";

import { loginApi } from "@/lib/api/end-points/auth-api";

import { showErrorToast } from "@/lib/utils/toast";

import { useRouter } from "next/navigation";

type LoginFormProps = {
  dict: {
    auth: {
      email: string;
      password: string;
      rememberMe: string;
      forgotPassword: string;
      loginButton: string;
      emailPlaceholder: string;
      passwordPlaceholder: string;
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

export function LoginForm({ dict, locale }: LoginFormProps) {
  const isArabic = locale === "ar";

  const schemas = createAuthValidationSchemas(dict.validation);

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginClientSchema>({
    resolver: zodResolver(schemas.loginClientSchema),

    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginClientSchema) {
    try {
      const respone = await loginApi(data);
      console.log("Login successful:", respone);

      router.push(`/${locale}/admin/dashboard`);
    } catch (error) {
      if (error instanceof Error) {
        showErrorToast(error.message);
        return;
      }

      return showErrorToast(
        isArabic
          ? "حدث خطأ أثناء تسجيل الدخول"
          : "An error occurred during login",
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <PremiumInput
        label={dict.auth.email}
        type="email"
        placeholder={dict.auth.emailPlaceholder}
        icon={Mail}
        error={errors.email?.message}
        disabled={isSubmitting}
        {...register("email")}
      />

      <PremiumInput
        label={dict.auth.password}
        type="password"
        placeholder={dict.auth.passwordPlaceholder}
        icon={Lock}
        locale={locale}
        error={errors.password?.message}
        disabled={isSubmitting}
        {...register("password")}
      />

      <div className="flex items-center justify-between gap-4 text-sm">
        <label className="flex cursor-pointer items-center gap-2 text-[var(--secondary)]">
          <input type="checkbox" className="h-4 w-4 accent-[var(--primary)]" />
          {dict.auth.rememberMe}
        </label>

        <Link
          href={`/${locale}/admin/forgot-password`}
          className="text-[var(--secondary)] underline-offset-4 hover:text-[var(--primary)] hover:underline"
        >
          {dict.auth.forgotPassword}
        </Link>
      </div>

      <PremiumButton type="submit" loading={isSubmitting}>
        {dict.auth.loginButton}
      </PremiumButton>
    </form>
  );
}
