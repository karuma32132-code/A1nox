import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { formatBDT } from '../utils/translations';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Truck,
  CheckCircle2,
  Tag,
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    deliveryCharge,
    discountAmount,
    cartTotal,
    isFreeDeliveryQualified,
    amountNeededForFreeDelivery,
    settings,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    setIsCheckoutOpen,
    language,
    t,
    toast,
  } = useStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ success: boolean; message: string } | null>(null);

  if (!isCartOpen) return null;

  const freeShippingProgress = Math.min(
    100,
    Math.round((cartSubtotal / settings.freeDeliveryThreshold) * 100)
  );

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    setCouponFeedback(res);
    if (res.success) {
      setCouponInput('');
      toast.success(res.message, { title: 'Coupon Applied' });
    } else {
      toast.error(res.message, { title: 'Invalid Coupon' });
    }
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-250">
        {/* Drawer Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#D32F2F]" />
            <h2 className="font-bold text-base text-gray-900">
              {t.cart} ({cart.reduce((sum, item) => sum + item.quantity, 0)})
            </h2>
          </div>

          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition cursor-pointer"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Bangladesh Free Shipping Progress Bar */}
        <div className="p-4 bg-red-50/50 border-b border-red-100">
          <div className="flex items-center gap-2 text-xs font-bold mb-2">
            <Truck className="w-4 h-4 text-[#D32F2F]" />
            {isFreeDeliveryQualified ? (
              <span className="text-green-700 flex items-center gap-1 font-extrabold">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                {t.freeShippingQualified}
              </span>
            ) : (
              <span className="text-[#D32F2F]">
                {t.freeShippingSpendMore(amountNeededForFreeDelivery)}
              </span>
            )}
          </div>

          {/* Progress track */}
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isFreeDeliveryQualified ? 'bg-green-500' : 'bg-[#D32F2F]'
              }`}
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-gray-400 font-medium mt-1">
            <span>৳0</span>
            <span>Target: {formatBDT(settings.freeDeliveryThreshold)}</span>
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-gray-100">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-red-50 text-[#D32F2F] flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-[#D32F2F]" />
              </div>
              <h3 className="font-bold text-gray-800 text-base">Your Bag is Empty</h3>
              <p className="text-xs text-gray-400 max-w-xs">
                Explore our trending gadgets, clothing, and accessories to fill up your cart!
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="mt-2 bg-[#D32F2F] hover:bg-[#B71C1C] text-white text-xs font-bold py-2.5 px-6 rounded-full transition cursor-pointer"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            cart.map((item, index) => (
              <div key={`${item.product.id}-${item.selectedColor || 'default'}-${index}`} className="py-3.5 flex gap-3.5">
                {/* Item Thumbnail */}
                <div className="w-18 h-18 rounded-xl bg-gray-50 border border-gray-100 p-1 shrink-0 overflow-hidden">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.title}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Item Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-gray-800 line-clamp-1">
                        {language === 'bn' ? item.product.titleBn : item.product.title}
                      </h4>
                      {item.selectedColor && (
                        <span className="text-[10px] text-gray-400 block mt-0.5">
                          {t.color}: {item.selectedColor}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id, item.selectedColor)}
                      className="text-gray-300 hover:text-red-500 transition cursor-pointer p-1"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs font-bold text-gray-900">
                      {formatBDT(item.product.price * item.quantity)}
                    </span>

                    {/* Quantity Selector */}
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.quantity - 1, item.selectedColor)}
                        className="px-2 py-0.5 text-gray-600 hover:bg-gray-100 transition cursor-pointer text-xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-bold text-gray-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.quantity + 1, item.selectedColor)}
                        className="px-2 py-0.5 text-gray-600 hover:bg-gray-100 transition cursor-pointer text-xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer: Coupon, Summary, Checkout Button */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-gray-100 bg-gray-50/80 space-y-3">
            {/* Coupon Code Section */}
            <div>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 p-2 rounded-xl text-xs">
                  <div className="flex items-center gap-1.5 text-green-700 font-bold">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Coupon: {appliedCoupon.code}</span>
                    <span className="text-green-600 font-normal">(-{formatBDT(discountAmount)})</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-gray-400 hover:text-red-600 text-xs font-semibold cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={e => setCouponInput(e.target.value)}
                    placeholder={t.haveCoupon}
                    className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-[#D32F2F]"
                  />
                  <button
                    type="submit"
                    className="bg-gray-800 hover:bg-black text-white text-xs font-bold px-3 py-1.5 rounded-xl transition cursor-pointer"
                  >
                    {t.apply}
                  </button>
                </form>
              )}

              {couponFeedback && (
                <p
                  className={`text-[11px] mt-1 font-medium ${
                    couponFeedback.success ? 'text-green-600' : 'text-red-500'
                  }`}
                >
                  {couponFeedback.message}
                </p>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs pt-1">
              <div className="flex justify-between text-gray-600">
                <span>{t.subtotal}</span>
                <span className="font-semibold text-gray-800">{formatBDT(cartSubtotal)}</span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>{t.deliveryCharge}</span>
                <span className="font-semibold">
                  {deliveryCharge === 0 ? (
                    <span className="text-green-600 font-bold">{t.free}</span>
                  ) : (
                    formatBDT(deliveryCharge)
                  )}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600 font-semibold">
                  <span>Discount</span>
                  <span>-{formatBDT(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm font-black text-gray-900 pt-2 border-t border-gray-200">
                <span>{t.total}</span>
                <span className="text-[#D32F2F] text-base">{formatBDT(cartTotal)}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={handleProceedToCheckout}
              className="w-full bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-bold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-500/25 transition-all cursor-pointer"
            >
              <span>{t.proceedToCheckout}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
