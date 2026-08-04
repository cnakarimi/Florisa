import type { ProductType, SaleUnit } from "@/features/catalog/types";

export interface UserAddress {
  id: number;
  title: string;
  recipient_name: string;
  recipient_phone: string;
  province: "تهران";
  city: "تهران";
  district: string;
  address_line: string;
  plaque: string;
  unit: string;
  postal_code: string;
  delivery_note: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface AddressInput {
  title?: string;
  recipient_name: string;
  recipient_phone: string;
  province: "تهران";
  city: "تهران";
  district?: string;
  address_line: string;
  plaque?: string;
  unit?: string;
  postal_code?: string;
  delivery_note?: string;
  is_default?: boolean;
}

export interface CheckoutItemInput {
  product_id: number;
  quantity: number;
}

export interface PreviewItem {
  product_id: number;
  product_name: string;
  product_type: ProductType;
  sale_unit: SaleUnit;
  sale_unit_display: string;
  unit_size: number;
  quantity: number;
  unit_price: string;
  line_total: string;
  cover_image: string;
  stock_quantity: number;
  minimum_order_quantity: number;
}

export interface CartPreview {
  items: PreviewItem[];
  subtotal: string;
  delivery_fee: string;
  total: string;
  payment_method: "cash_on_delivery";
  payment_method_display: string;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "out_for_delivery"
  | "delivered"
  | "canceled";

export interface OrderItem extends Omit<PreviewItem, "product_id" | "stock_quantity" | "minimum_order_quantity"> {
  id: number;
  product: number | null;
}

export interface Order {
  public_number: string;
  status: OrderStatus;
  status_display: string;
  payment_method: "cash_on_delivery";
  payment_method_display: string;
  payment_status: "unpaid" | "paid";
  payment_status_display: string;
  subtotal: string;
  delivery_fee: string;
  total: string;
  address_title: string;
  recipient_name: string;
  recipient_phone: string;
  province: string;
  city: string;
  district: string;
  address_line: string;
  plaque: string;
  unit: string;
  postal_code: string;
  delivery_note: string;
  customer_note: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}
