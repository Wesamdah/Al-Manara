import { ShieldCheck } from "lucide-react";

type AuthLayoutProps = {
  children: React.ReactNode;
  locale: "en" | "ar";
};

export function AuthLayout({ children, locale }: AuthLayoutProps) {
  const isArabic = locale === "ar";

  return (
    <main className="editorial-grid relative flex items-center justify-center overflow-hidden px-4 sm:py-10">
      <section className="glass-card ambient-shadow relative w-full max-w-md p-8 md:p-10">
        <div className="mb-10 text-center">
          <div className="surface-card mx-auto mb-6 flex h-16 w-16 items-center justify-center">
            <ShieldCheck className="h-8 w-8 text-[var(--primary)]" />
          </div>

          <h1 className="display-font text-4xl font-extrabold tracking-[-0.02em]">
            {isArabic ? "المنارة" : "AL-MANARA"}
          </h1>

          <p className="mt-3 text-sm text-[var(--secondary)]">
            {isArabic ? "نظام إدارة المنارة" : "Car Management System"}
          </p>
        </div>

        {children}
      </section>
    </main>
  );
}
