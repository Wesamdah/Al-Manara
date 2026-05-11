import { AuthLayout } from "@/app/components/auth/AuthLayout";
import { ResetPasswordForm } from "@/app/components/auth/ResetPasswordForm";

import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";

type ResetPasswordPageProps = {
  params: Promise<{
    locale: Locale;
  }>;
};

export default async function ResetPasswordPage({
  params,
}: ResetPasswordPageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <AuthLayout locale={locale}>
      <ResetPasswordForm dict={dict} locale={locale} />
    </AuthLayout>
  );
}
