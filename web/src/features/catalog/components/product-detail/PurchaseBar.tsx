"use client";

import { useEffect, useRef, useState } from "react";
import { formatTomanAmount } from "@/utils/persian";
import styles from "./PlantMobileDetail.module.css";

export function PurchaseBar({ total, canBuy, onAdd }: { total: number; canBuy: boolean; onAdd: () => void | Promise<void> }) {
  const [state, setState] = useState<"ready" | "adding" | "added" | "error">("ready");
  const locked = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const add = async () => {
    if (!canBuy || locked.current) return;
    locked.current = true;
    setState("adding");
    try {
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
      await onAdd();
      setState("added");
    } catch {
      setState("error");
    } finally {
      timer.current = setTimeout(() => { locked.current = false; setState("ready"); }, 1000);
    }
  };
  const busy = state === "adding" || state === "added";
  return <aside data-footer-overlay="product-actions" className={styles.purchaseBar} aria-label="خرید محصول">
    <div className="mx-auto flex min-h-[72px] w-full items-center justify-between gap-3 px-4 py-4">
      <p className="flex min-w-0 items-baseline gap-1 text-mobile-body-small text-text-secondary" aria-label={`قیمت کل ${formatTomanAmount(total)} تومان`}>
        <bdi className="numeric-ltr text-mobile-heading-h3 font-bold text-text-primary" data-purchase-total>{formatTomanAmount(total)}</bdi> تومان
      </p>
      <button type="button" onClick={add} disabled={!canBuy || busy} aria-busy={state === "adding"} className="flex h-10 w-36 shrink-0 items-center justify-center rounded-[10px] bg-action-primary px-2 text-mobile-ui-button font-semibold text-background-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action-primary disabled:cursor-not-allowed disabled:opacity-60">
        {!canBuy ? "ناموجود" : state === "adding" ? "در حال افزودن…" : state === "added" ? "به سبد اضافه شد" : "افزودن به سبد"}
      </button>
    </div>
    <p role="status" className={state === "error" ? "px-4 pb-2 text-xs text-red-400" : "sr-only"}>{state === "error" ? "افزودن به سبد انجام نشد. دوباره تلاش کنید." : state === "added" ? "محصول به سبد خرید اضافه شد." : ""}</p>
  </aside>;
}
