import Image from "next/image";
import { Flower2 } from "lucide-react";
import { API_BASE_URL } from "@/lib/api/config";

interface CatalogImageProps {
  src: string | null;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
}

function resolveImageUrl(src: string): string {
  if (/^https?:\/\//i.test(src)) {
    return src;
  }

  return new URL(src, `${API_BASE_URL}/`).toString();
}

export function CatalogImage({
  src,
  alt,
  sizes,
  className = "object-cover object-center",
  priority = false,
}: CatalogImageProps) {
  if (!src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-950/70 to-[#171923] text-emerald-400/50"
      >
        <Flower2 className="h-14 w-14 stroke-[1.25]" />
      </div>
    );
  }

  return (
    <Image
      fill
      src={resolveImageUrl(src)}
      alt={alt}
      sizes={sizes}
      className={className}
      priority={priority}
    />
  );
}
