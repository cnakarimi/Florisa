import { toPersianDigits } from "@/features/auth/utils/digits";

export { toPersianDigits };

export function formatTomanAmount(price: number): string {
  return price.toLocaleString("fa-IR");
}

export function formatToman(price: number): string {
  return `${formatTomanAmount(price)} تومان`;
}

export function formatPersianNumber(value: number): string {
  const withSeparators = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return toPersianDigits(withSeparators);
}
