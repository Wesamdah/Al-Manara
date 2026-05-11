import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";
import { AuthLayout } from "@/app/components/auth/AuthLayout";
import { LoginForm } from "@/app/components/auth/LoginForm";

type LoginPageProps = {
  params: Promise<{
    locale: Locale;
  }>;
};

export default async function LoginPage({ params }: LoginPageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <AuthLayout locale={locale}>
      <LoginForm locale={locale} dict={dict} />
    </AuthLayout>
  );
}
