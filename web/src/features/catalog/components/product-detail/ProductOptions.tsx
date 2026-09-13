"use client";

import { useState } from "react";

const POT_SIZES = [
  { id: "small", label: "کوچک" },
  { id: "medium", label: "متوسط" },
  { id: "large", label: "بزرگ" },
] as const;

const POT_COLORS = [
  {
    id: "white",
    label: "سفید",
    value: "#F2F2F2",
  },
  {
    id: "green",
    label: "سبز",
    value: "#4F7A5A",
  },
  {
    id: "terracotta",
    label: "سفالی",
    value: "#B85C38",
  },
  {
    id: "black",
    label: "مشکی",
    value: "#1C1C1C",
  },
] as const;

export function ProductOptions() {
  const [selectedSize, setSelectedSize] = useState("medium");
  const [selectedColor, setSelectedColor] = useState("terracotta");

  return (
    <section
      className="mt-5 flex flex-col gap-6"
      aria-label="انتخاب مشخصات گلدان"
    >
      {/* Pot size */}
      <div className="flex flex-col gap-3">
        <p className="text-right text-sm font-medium text-text-secondary">
          اندازه گلدان
        </p>

        <div className="grid grid-cols-3 gap-2" dir="rtl">
          {POT_SIZES.map((size) => {
            const isSelected = selectedSize === size.id;

            return (
              <button
                key={size.id}
                type="button"
                onClick={() => setSelectedSize(size.id)}
                aria-pressed={isSelected}
                className={`h-10 rounded-lg border text-sm transition-colors ${
                  isSelected
                    ? "border-action-primary bg-background-secondary font-medium text-text-brand"
                    : "border-border-subtle bg-transparent font-normal text-text-secondary hover:border-action-primary/40 hover:text-text-primary"
                }`}
              >
                {size.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Pot color */}
      <div className="flex flex-col gap-3">
        <p className="text-right text-sm font-medium text-text-secondary">
          رنگ گلدان
        </p>

        <div className="flex items-center justify-start gap-3" dir="rtl">
          {POT_COLORS.map((color) => {
            const isSelected = selectedColor === color.id;

            return (
              <button
                key={color.id}
                type="button"
                onClick={() => setSelectedColor(color.id)}
                aria-label={`رنگ ${color.label}`}
                aria-pressed={isSelected}
                title={color.label}
                className={`grid size-8 shrink-0 place-items-center rounded-full border transition-colors ${
                  isSelected
                    ? "border-2 border-action-primary"
                    : "border-border-subtle hover:border-action-primary/50"
                }`}
              >
                <span
                  className="size-6 rounded-full"
                  style={{ backgroundColor: color.value }}
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
