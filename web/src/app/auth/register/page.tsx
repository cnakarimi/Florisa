import { RegisterExperience } from "@/features/auth/components/RegisterExperience";
import { sanitizeNextPath } from "@/features/auth/utils/redirect";

interface RegisterPageProps {
  searchParams: Promise<{
    next?: string | string[];
  }>;
}

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  const { next } = await searchParams;
  return <RegisterExperience nextPath={sanitizeNextPath(next)} />;
}
