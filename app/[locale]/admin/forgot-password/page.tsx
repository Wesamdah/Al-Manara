import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";
import { AuthLayout } from "@/app/components/auth/AuthLayout";
import { ForgotPasswordForm } from "@/app/components/auth/ForgotPasswordForm";

type ForgotPasswordPageProps = {
  params: Promise<{
    locale: Locale;
  }>;
};

export default async function ForgotPasswordPage({
  params,
}: ForgotPasswordPageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <AuthLayout locale={locale}>
      <ForgotPasswordForm dict={dict} locale={locale} />
    </AuthLayout>
  );
}
