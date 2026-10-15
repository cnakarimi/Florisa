"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { formatTomanAmount } from "@/utils/persian";
import styles from "./PlantMobileDetail.module.css";

export function PurchaseBar({ total, canBuy, onAdd, onPendingChange, summary, disabledLabel = "ناموجود", mutedDisabled = false }: { total: number; canBuy: boolean; onAdd: () => void | Promise<void>; onPendingChange?: (pending: boolean) => void; summary?: ReactNode; disabledLabel?: string; mutedDisabled?: boolean }) {
  const [state, setState] = useState<"ready" | "adding" | "added" | "error">("ready");
  const [errorMessage, setErrorMessage] = useState("");
  const locked = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const add = async () => {
    if (!canBuy || locked.current) return;
    locked.current = true;
    onPendingChange?.(true);
    setState("adding");
    try {
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
      await onAdd();
      setState("added");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "افزودن به سبد انجام نشد. دوباره تلاش کنید.");
      setState("error");
    } finally {
      timer.current = setTimeout(() => { locked.current = false; setState("ready"); onPendingChange?.(false); }, 1000);
    }
  };
  const busy = state === "adding" || state === "added";
  return <aside data-footer-overlay="product-actions" className={styles.purchaseBar} aria-label="خرید محصول">
    <div className="mx-auto flex min-h-[72px] w-full items-center justify-between gap-3 px-4 py-4">
      {summary ?? <p className="flex min-w-0 items-baseline gap-1 text-mobile-body-small text-text-secondary" aria-label={`قیمت کل ${formatTomanAmount(total)} تومان`}>
        <bdi className="numeric-ltr text-mobile-heading-h3 font-bold text-text-primary" data-purchase-total>{formatTomanAmount(total)}</bdi> تومان
      </p>}
      <button type="button" onClick={add} disabled={!canBuy || busy} aria-busy={state === "adding"} className={`flex h-10 w-36 shrink-0 items-center justify-center rounded-[10px] px-2 text-mobile-ui-button font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action-primary disabled:cursor-not-allowed ${!canBuy && mutedDisabled ? "bg-background-tertiary text-text-tertiary opacity-72" : "bg-action-primary text-background-secondary disabled:opacity-60"}`}>
        {!canBuy ? disabledLabel : state === "adding" ? "در حال افزودن…" : state === "added" ? "به سبد اضافه شد" : "افزودن به سبد"}
      </button>
    </div>
    <p role="status" className={state === "error" ? "px-4 pb-2 text-xs text-red-400" : "sr-only"}>{state === "error" ? errorMessage : state === "added" ? "محصول به سبد خرید اضافه شد." : ""}</p>
  </aside>;
}
