import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, Check, ShieldCheck, Tag } from 'lucide-react';
import type { CartItem } from '../types';
import { CatalogImage } from '@/features/catalog/components/CatalogImage';
import { formatToman, toPersianDigits } from '../utils/persian';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemoveItem: (productId: number) => void;
  onClearCart: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  const [coupon, setCoupon] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price_per_bundle * item.quantity,
    0,
  );
  const shippingFee = subtotal > 1000000 ? 0 : 45000;
  const discountAmount = discountApplied ? subtotal * 0.1 : 0;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (coupon.trim().toLowerCase() === 'barg10' || coupon.trim() === 'برگ۱۰') {
      setDiscountApplied(true);
    } else {
      alert('کد تخفیف معتبر نیست. از کد "BARG10" برای ۱۰٪ تخفیف استفاده کنید.');
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    setOrderSuccess(true);
    setTimeout(() => {
      onClearCart();
      setOrderSuccess(false);
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#14151e] border-r border-white/10 h-full flex flex-col justify-between text-right p-5 animate-in slide-in-from-left duration-300">
        {/* Cart Header */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-lg text-white">سبد خرید شما</h3>
              <span className="text-xs text-zinc-400 font-mono">
                ({toPersianDigits(cartItems.length)} کالا)
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          {cartItems.length === 0 ? (
            <div className="py-20 text-center text-zinc-500">
              <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30 text-emerald-400" />
              <p className="text-sm font-medium">سبد خرید شما خالی است</p>
              <p className="text-xs mt-1 text-zinc-600">
                گیاهان و گل‌های مورد علاقه خود را اضافه کنید
              </p>
            </div>
          ) : (
            <div className="py-4 space-y-3 max-h-[50vh] overflow-y-auto pl-1">
              {cartItems.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#1c1e2a] border border-white/5 gap-3"
                >
                  {/* Thumbnail */}
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-black/40">
                    <CatalogImage
                      src={item.product.cover_image}
                      alt={item.product.name}
                      sizes="64px"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-white mb-0.5">{item.product.name}</h4>
                    <p className="text-[10px] text-zinc-400 mb-1">
                      {item.product.stems_per_bundle} شاخه در هر دسته
                    </p>
                    <span className="text-xs font-extrabold text-amber-400">
                      {formatToman(item.product.price_per_bundle * item.quantity)}
                    </span>
                  </div>

                  {/* Quantity & Delete */}
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="text-zinc-500 hover:text-rose-400 p-1"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-1.5 bg-[#12131a] border border-white/10 rounded-lg p-0.5 text-xs">
                      <button
                        onClick={() =>
                          onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))
                        }
                        className="w-5 h-5 rounded flex items-center justify-center text-zinc-300 hover:bg-white/10"
                      >
                        -
                      </button>
                      <span className="w-4 text-center font-bold text-white">
                        {toPersianDigits(item.quantity)}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        className="w-5 h-5 rounded flex items-center justify-center text-zinc-300 hover:bg-white/10"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Coupon & Summary Footer */}
        {cartItems.length > 0 && (
          <div className="pt-4 border-t border-white/10 space-y-3">
            {/* Coupon Code Input */}
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder="کد تخفیف (مثال: BARG10)"
                className="flex-1 bg-[#1c1e2a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs px-3 py-2 rounded-xl"
              >
                اعمال
              </button>
            </form>

            {discountApplied && (
              <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" />
                تخفیف ۱۰٪ی با موفقیت اعمال شد!
              </p>
            )}

            {/* Calculations */}
            <div className="space-y-1.5 text-xs text-zinc-300 pt-2 border-t border-white/5">
              <div className="flex justify-between">
                <span className="text-zinc-400">جمع کل کالاها</span>
                <span>{formatToman(subtotal)}</span>
              </div>
              {discountApplied && (
                <div className="flex justify-between text-emerald-400">
                  <span>تخفیف</span>
                  <span>- {formatToman(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-zinc-400">هزینه ارسال ایمن</span>
                <span>{shippingFee === 0 ? 'رایگان' : formatToman(shippingFee)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-white pt-2 border-t border-white/10">
                <span>مبلغ قابل پرداخت</span>
                <span className="text-amber-400">{formatToman(grandTotal)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={orderSuccess}
              className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50"
            >
              {orderSuccess ? (
                <>
                  <Check className="w-5 h-5 text-black" />
                  <span>سفارش با موفقیت ثبت شد!</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>تکمیل و پرداخت آنلاین</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
