import type { Metadata } from "next";
import { ProductDetailExperience } from "@/features/catalog/components/ProductDetailExperience";
import { ShopNavigationScrollNavbar } from "@/features/home/components/ShopNavigationScrollNavbar";

export const metadata: Metadata = {
  title: "جزئیات محصول | فلوریسا",
  description: "مشاهده مشخصات و موجودی محصول در فروشگاه فلوریسا",
};

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  return (
    <>
      <ShopNavigationScrollNavbar />
      <ProductDetailExperience slug={slug} />
    </>
  );
}
