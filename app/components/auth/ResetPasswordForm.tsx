"use client";

import { KeyRound, Lock } from "lucide-react";

import { PremiumButton } from "../ui/PremiumButton";
import { PremiumInput } from "../ui/PremiumInput";

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
  };
};

export function ResetPasswordForm({
  dict,
  locale,
}: ResetPasswordFormProps & { locale: "en" | "ar" }) {
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

      <form className="space-y-6">
        <PremiumInput
          label={dict.auth.otp}
          name="otp"
          placeholder={dict.auth.otpPlaceholder}
          icon={KeyRound}
        />

        <PremiumInput
          label={dict.auth.newPassword}
          type="password"
          name="newPassword"
          placeholder={dict.auth.passwordPlaceholder}
          icon={Lock}
          locale={locale}
        />

        <PremiumInput
          label={dict.auth.confirmPassword}
          type="password"
          name="confirmPassword"
          placeholder={dict.auth.passwordPlaceholder}
          icon={Lock}
          locale={locale}
        />

        <PremiumButton type="submit">{dict.auth.resetButton}</PremiumButton>
      </form>
    </div>
  );
}
