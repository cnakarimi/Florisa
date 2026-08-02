"use client";

import { useState } from "react";
import Image from "next/image";
import { Flower2 } from "lucide-react";

import { resolveCatalogImageUrl } from "@/features/catalog/utils/images";

interface CatalogImageProps {
  src: string | null;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
}

export function CatalogImage({
  src,
  alt,
  sizes,
  className = "object-cover object-center",
  priority = false,
}: CatalogImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const resolvedSrc = resolveCatalogImageUrl(src);

  if (!resolvedSrc || failedSrc === resolvedSrc) {
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
      src={resolvedSrc}
      alt={alt}
      sizes={sizes}
      className={className}
      priority={priority}
      unoptimized
      onError={() => setFailedSrc(resolvedSrc)}
    />
  );
}
