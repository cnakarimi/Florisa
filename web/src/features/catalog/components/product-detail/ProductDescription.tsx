"use client";

import { useId, useState } from "react";
import { ProductDesignIcon } from "./PlantMobileSections";

export function ProductDescription({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const id = useId();
  if (!text.trim()) return null;
  return (
    <section className="px-4 py-8" aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className="text-mobile-heading-h4 font-semibold">درباره این محصول</h2>
      <div className="relative mt-3">
        <p id={`${id}-body`} className={`whitespace-pre-line break-words text-mobile-body-base text-text-secondary ${expanded ? "" : "line-clamp-3"}`}>{text}</p>
        {!expanded && <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-b from-transparent to-background-primary" />}
      </div>
      <button type="button" aria-expanded={expanded} aria-controls={`${id}-body`} onClick={() => setExpanded(value => !value)} className="mt-3 flex items-center gap-1.5 py-1 text-mobile-ui-button font-semibold text-text-accent focus-visible:outline-2 focus-visible:outline-action-primary">
        {expanded ? "نمایش کمتر" : "ادامه مطلب"}<ProductDesignIcon name="description-arrow" />
      </button>
    </section>
  );
}
