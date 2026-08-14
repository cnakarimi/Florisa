import type { AddressInput, UserAddress } from "@/features/orders/types";

export function addressToInput(address: UserAddress): AddressInput {
  return {
    title: address.title,
    recipient_name: address.recipient_name,
    recipient_phone: address.recipient_phone,
    province: address.province,
    city: address.city,
    district: address.district,
    address_line: address.address_line,
    plaque: address.plaque,
    unit: address.unit,
    postal_code: address.postal_code,
    delivery_note: address.delivery_note,
    is_default: address.is_default,
  };
}

export function upsertAddress(current: UserAddress[], saved: UserAddress): UserAddress[] {
  const next = current
    .filter((item) => item.id !== saved.id)
    .map((item) => saved.is_default ? { ...item, is_default: false } : item);
  return [saved, ...next].sort((left, right) => Number(right.is_default) - Number(left.is_default));
}

export async function removeAddressAfterSuccess(
  current: UserAddress[],
  addressId: number,
  request: () => Promise<void>,
): Promise<UserAddress[]> {
  await request();
  return current.filter((item) => item.id !== addressId);
}
