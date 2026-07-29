import { PhoneAuthForm } from "@/features/auth/components/PhoneAuthForm";
import { sanitizeNextPath } from "@/features/auth/utils/redirect";

interface AuthPageProps {
  searchParams: Promise<{
    next?: string | string[];
  }>;
}

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const { next } = await searchParams;
  return <PhoneAuthForm nextPath={sanitizeNextPath(next)} />;
}
