"use client";

import { forwardRef, type InputHTMLAttributes } from "react";

import { useState } from "react";

import { type LucideIcon } from "lucide-react";
import { Eye, EyeClosed } from "lucide-react";
import { Locale } from "@/lib/i18n/dictionaries";

type PremiumInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;

  icon?: LucideIcon;

  error?: string;

  locale?: Locale;
};

export const PremiumInput = forwardRef<HTMLInputElement, PremiumInputProps>(
  (
    {
      label,
      type = "text",
      placeholder,
      icon: Icon,
      error,
      className,
      locale,
      ...props
    },
    ref,
  ) => {
    // const isArabic = document.documentElement.lang === "ar";
    const isArabic = locale === "ar";
    typeof window !== "undefined" && document.documentElement.lang === "ar";

    const [typo, setTypo] = useState(type);

    const EyeShape = typo === "password" ? Eye : EyeClosed;

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[var(--on-surface)]">
          {label}
        </label>

        <div className="relative">
          {type === "password" && (
            <EyeShape
              className={` ${isArabic ? "left-0" : "right-0"} absolute  top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--secondary)]`}
              onClick={() => setTypo(typo === "text" ? "password" : "text")}
            />
          )}

          {Icon && (
            <Icon className="absolute inset-0 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--secondary)]" />
          )}

          <input
            ref={ref}
            type={typo}
            placeholder={placeholder}
            className={`
            premium-input
            h-12
            w-full
            ps-8
            text-sm
            text-[var(--on-surface)]
            placeholder:text-[var(--on-surface-variant)]

            disabled:cursor-not-allowed
            disabled:opacity-50

            ${error ? "border-b-red-500" : ""}

            ${className ?? ""}
          `}
            {...props}
          />
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  },
);
