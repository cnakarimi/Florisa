import { OtpVerifyForm } from "@/features/auth/components/OtpVerifyForm";
import { sanitizeNextPath } from "@/features/auth/utils/redirect";

interface VerifyPageProps {
  searchParams: Promise<{
    next?: string | string[];
  }>;
}

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  const { next } = await searchParams;
  return <OtpVerifyForm nextPath={sanitizeNextPath(next)} />;
}
