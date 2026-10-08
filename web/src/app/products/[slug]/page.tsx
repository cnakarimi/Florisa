import type { Metadata, Viewport } from "next";
import { ProductDetailExperience } from "@/features/catalog/components/product-detail/ProductDetailExperience";
import { ShopTopNavbar } from "@/components/navigation/ShopTopNavbar";
export const metadata: Metadata = {
  title: "جزئیات محصول | فلوریسا",
  description: "مشاهده مشخصات و موجودی محصول در فروشگاه فلوریسا",
};

export const viewport: Viewport = { viewportFit: "cover" };

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  return (
    <>
      <div data-product-route-navbar>
        <ShopTopNavbar />
      </div>
      <ProductDetailExperience slug={slug} />
    </>
  );
}
