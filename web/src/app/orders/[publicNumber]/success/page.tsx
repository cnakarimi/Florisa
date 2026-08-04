import { OrderDetailExperience } from "@/features/orders/components/OrderDetailExperience";

export default async function OrderSuccessPage({ params }: { params: Promise<{ publicNumber: string }> }) {
  const { publicNumber } = await params;
  return <OrderDetailExperience publicNumber={publicNumber} success />;
}
