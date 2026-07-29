import { WelcomeExperience } from "@/features/auth/components/WelcomeExperience";

interface RegistrationSuccessPageProps {
  searchParams: Promise<{
    flow?: string | string[];
  }>;
}

export default async function RegistrationSuccessPage({
  searchParams,
}: RegistrationSuccessPageProps) {
  const { flow } = await searchParams;

  return (
    <WelcomeExperience
      flowToken={typeof flow === "string" ? flow : null}
    />
  );
}
