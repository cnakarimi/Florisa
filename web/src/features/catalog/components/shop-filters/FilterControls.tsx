import type { ReactNode } from "react";

import type { ProductQuery } from "@/features/catalog/types";

export type UpdateFilter = <K extends keyof ProductQuery>(
  key: K,
  value: ProductQuery[K] | undefined,
) => void;

export function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="space-y-2.5 border-b border-white/[0.06] pb-4 pt-2">
      <legend className="mb-2 text-[11px] font-bold text-[#c7a23c]">
        {title}
      </legend>

      {children}
    </fieldset>
  );
}

export function FilterInput({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: "text" | "number";
}) {
  return (
    <label className="block text-[10px] text-white/45">
      {label}

      <input
        type={type}
        min={type === "number" ? 0 : undefined}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 text-xs text-white outline-none focus:border-[#d4af37]/40"
      />
    </label>
  );
}

export function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: ReadonlyArray<readonly [string, string]>;
}) {
  return (
    <label className="block text-[10px] text-white/45">
      {label}

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 h-11 w-full rounded-xl border border-white/[0.08] bg-[#191b19] px-3 text-xs text-white outline-none focus:border-[#d4af37]/40"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue || "all"} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

export function FilterBoolean({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean | undefined;
  onChange: (value: boolean | undefined) => void;
}) {
  return (
    <FilterSelect
      label={label}
      value={value === undefined ? "" : String(value)}
      onChange={(next) => onChange(next === "" ? undefined : next === "true")}
      options={[
        ["", "همه"],
        ["true", "بله"],
        ["false", "خیر"],
      ]}
    />
  );
}
