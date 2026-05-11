"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Mail } from "lucide-react";

import { PremiumInput } from "../ui/PremiumInput";
import { PremiumButton } from "../ui/PremiumButton";

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
  };
  locale: "en" | "ar";
};

export function ForgotPasswordForm({ dict, locale }: ForgetPasswordFormProps) {
  const isArabic = locale === "ar";
  const ArrowIcon = isArabic ? ArrowRight : ArrowLeft;

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-semibold">{dict.auth.forgotTitle}</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--secondary)]">
          {dict.auth.forgotDescription}
        </p>
      </div>

      <form className="space-y-5">
        <PremiumInput
          label={dict.auth.email}
          type="email"
          name="email"
          placeholder={dict.auth.emailPlaceholder}
          icon={Mail}
        />

        <PremiumButton type="submit">{dict.auth.sendOtpButton}</PremiumButton>
      </form>

      <Link
        href={`/${locale}/admin/login`}
        className="mt-6 flex items-center justify-center gap-2 text-sm text-[var(--secondary)] hover:text-[var(--primary)]"
      >
        <ArrowIcon className="h-4 w-4" />
        {dict.auth.backToLogin}
      </Link>
    </div>
  );
}
