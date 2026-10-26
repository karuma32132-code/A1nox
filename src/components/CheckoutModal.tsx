import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { formatBDT } from '../utils/translations';
import { DeliveryZone, PaymentMethod, Order } from '../types';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Truck,
  CreditCard,
  Copy,
  Check,
  Lock,
  ArrowRight,
  Package,
} from 'lucide-react';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    setIsTrackingOpen,
    cart,
    cartSubtotal,
    deliveryCharge,
    discountAmount,
    cartTotal,
    deliveryZone,
    setDeliveryZone,
    isFreeDeliveryQualified,
    settings,
    submitOrder,
    currentUser,
    t,
  } = useStore();

  const [customerName, setCustomerName] = useState(currentUser?.displayName || '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || '');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [district, setDistrict] = useState('Dhaka');
  const [orderNotes, setOrderNotes] = useState('');

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [transactionId, setTransactionId] = useState('');
  const [copiedNumber, setCopiedNumber] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [formError, setFormError] = useState('');

  if (!isCheckoutOpen) return null;

  const handleCopyMerchantNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!customerName.trim()) {
      setFormError('Please enter your full name.');
      return;
    }

    if (!customerPhone.trim() || customerPhone.replace(/\D/g, '').length < 10) {
      setFormError('Please enter a valid 11-digit Bangladesh phone number (e.g. 01712345678).');
      return;
    }

    if (!deliveryAddress.trim()) {
      setFormError('Please provide your complete delivery address.');
      return;
    }

    if ((paymentMethod === 'bkash' || paymentMethod === 'nagad') && !transactionId.trim()) {
      setFormError('Please enter the 8-10 character Transaction ID (TrxID) from your bKash/Nagad SMS.');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderItems = cart.map(item => ({
        productId: item.product.id,
        productTitle: item.product.title,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.images[0],
        color: item.selectedColor,
      }));

      const newOrder = await submitOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        deliveryAddress: deliveryAddress.trim(),
        district,
        deliveryZone,
        subtotal: cartSubtotal,
        deliveryCharge,
        discount: discountAmount,
        total: cartTotal,
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
        transactionId: transactionId.trim() || undefined,
        status: 'pending',
        items: orderItems,
        notes: orderNotes.trim() || undefined,
      });

      setCompletedOrder(newOrder);
    } catch (err) {
      setFormError('An error occurred while confirming your order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden border border-gray-100 my-auto relative">
        {/* Close button */}
        <button
          onClick={() => {
            setIsCheckoutOpen(false);
            setCompletedOrder(null);
          }}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {completedOrder ? (
          /* Order Confirmation View */
          <div className="p-6 sm:p-10 text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                Order Placed Successfully!
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">
                Thank You, {completedOrder.customerName}!
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Your order has been recorded. Our customer representative will call you shortly to verify delivery.
              </p>
            </div>

            {/* Order Details Card */}
            <div className="bg-gray-50 rounded-2xl p-4 sm:p-6 text-left border border-gray-100 max-w-md mx-auto space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500 font-medium">Order Number:</span>
                <span className="font-black text-[#D32F2F]">{completedOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500 font-medium">Total Payable:</span>
                <span className="font-bold text-gray-900">{formatBDT(completedOrder.total)}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500 font-medium">Payment Mode:</span>
                <span className="font-bold text-gray-800 uppercase">
                  {completedOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : completedOrder.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500 font-medium">Delivery Zone:</span>
                <span className="font-bold text-gray-800">
                  {completedOrder.deliveryZone === 'inside_dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Delivery Address:</span>
                <span className="font-medium text-gray-800 text-right max-w-[200px] truncate">
                  {completedOrder.deliveryAddress}
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  setIsCheckoutOpen(false);
                  setIsTrackingOpen(true);
                }}
                className="bg-gray-900 hover:bg-black text-white font-bold py-3 px-6 rounded-full text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Truck className="w-4 h-4 text-amber-400" />
                <span>Track This Order</span>
              </button>
              <button
                onClick={() => {
                  setIsCheckoutOpen(false);
                  setCompletedOrder(null);
                }}
                className="bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-bold py-3 px-8 rounded-full text-xs sm:text-sm shadow-md transition cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handleSubmit} className="p-4 sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-[#D32F2F] flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-gray-900">
                  {t.proceedToCheckout}
                </h2>
                <p className="text-xs text-gray-500">
                  Fast Bangladesh Delivery with Free Home Delivery threshold
                </p>
              </div>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-semibold">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Column: Customer & Delivery Info */}
              <div className="md:col-span-7 space-y-4">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2">
                  <Truck className="w-4 h-4 text-[#D32F2F]" />
                  <span>Delivery Information</span>
                </h3>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    {t.fullName} *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="e.g. Arman Hossen"
                    className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#D32F2F]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    {t.phoneNumber} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#D32F2F]"
                  />
                </div>

                {/* Delivery Zone Selection (Inside / Outside Dhaka) */}
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-2">
                    {t.deliveryLocation} *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setDeliveryZone('inside_dhaka')}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition cursor-pointer ${
                        deliveryZone === 'inside_dhaka'
                          ? 'border-[#D32F2F] bg-red-50/50 text-[#D32F2F]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{t.insideDhaka}</span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            deliveryZone === 'inside_dhaka'
                              ? 'border-[#D32F2F] bg-[#D32F2F]'
                              : 'border-gray-300'
                          }`}
                        >
                          {deliveryZone === 'inside_dhaka' && (
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </div>
                      </div>
                      <span className="text-[11px] text-gray-500 font-medium mt-1">
                        {isFreeDeliveryQualified
                          ? 'Free'
                          : formatBDT(settings.insideDhakaDeliveryFee)}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryZone('outside_dhaka')}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition cursor-pointer ${
                        deliveryZone === 'outside_dhaka'
                          ? 'border-[#D32F2F] bg-red-50/50 text-[#D32F2F]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{t.outsideDhaka}</span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            deliveryZone === 'outside_dhaka'
                              ? 'border-[#D32F2F] bg-[#D32F2F]'
                              : 'border-gray-300'
                          }`}
                        >
                          {deliveryZone === 'outside_dhaka' && (
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </div>
                      </div>
                      <span className="text-[11px] text-gray-500 font-medium mt-1">
                        {isFreeDeliveryQualified
                          ? 'Free'
                          : formatBDT(settings.outsideDhakaDeliveryFee)}
                      </span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    {t.deliveryAddress} *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={deliveryAddress}
                    onChange={e => setDeliveryAddress(e.target.value)}
                    placeholder="House, Road, Area, Ward/Thana"
                    className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#D32F2F]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      {t.district}
                    </label>
                    <input
                      type="text"
                      value={district}
                      onChange={e => setDistrict(e.target.value)}
                      placeholder="e.g. Dhaka"
                      className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#D32F2F]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      {t.optionalEmail}
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={e => setCustomerEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#D32F2F]"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Payment Options & Order Total */}
              <div className="md:col-span-5 space-y-4">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2">
                  <CreditCard className="w-4 h-4 text-[#D32F2F]" />
                  <span>{t.paymentMethod}</span>
                </h3>

                {/* Payment Methods */}
                <div className="space-y-2">
                  {/* Cash on Delivery */}
                  {settings.codEnabled && (
                    <label
                      onClick={() => setPaymentMethod('cod')}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                        paymentMethod === 'cod'
                          ? 'border-[#D32F2F] bg-red-50/40 text-gray-900'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === 'cod'}
                          onChange={() => setPaymentMethod('cod')}
                          className="accent-[#D32F2F]"
                        />
                        <div>
                          <span className="text-xs font-bold block">{t.cashOnDelivery}</span>
                          <span className="text-[10px] text-gray-500">Pay when delivered</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-gray-600">COD</span>
                    </label>
                  )}

                  {/* bKash */}
                  {settings.bkashEnabled && (
                    <label
                      onClick={() => setPaymentMethod('bkash')}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                        paymentMethod === 'bkash'
                          ? 'border-[#E2136E] bg-pink-50/40 text-gray-900'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === 'bkash'}
                          onChange={() => setPaymentMethod('bkash')}
                          className="accent-[#E2136E]"
                        />
                        <div>
                          <span className="text-xs font-bold text-[#E2136E] block">bKash Payment</span>
                          <span className="text-[10px] text-gray-500">Send money / Merchant Pay</span>
                        </div>
                      </div>
                      <span className="text-xs font-black text-[#E2136E]">bKash</span>
                    </label>
                  )}

                  {/* Nagad */}
                  {settings.nagadEnabled && (
                    <label
                      onClick={() => setPaymentMethod('nagad')}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                        paymentMethod === 'nagad'
                          ? 'border-[#F7941D] bg-orange-50/40 text-gray-900'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === 'nagad'}
                          onChange={() => setPaymentMethod('nagad')}
                          className="accent-[#F7941D]"
                        />
                        <div>
                          <span className="text-xs font-bold text-[#F7941D] block">Nagad Payment</span>
                          <span className="text-[10px] text-gray-500">Fast mobile banking</span>
                        </div>
                      </div>
                      <span className="text-xs font-black text-[#F7941D]">Nagad</span>
                    </label>
                  )}
                </div>

                {/* TrxID Input for bKash / Nagad */}
                {(paymentMethod === 'bkash' || paymentMethod === 'nagad') && (
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-700">
                        {paymentMethod === 'bkash' ? 'bKash' : 'Nagad'} Number:
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopyMerchantNumber(
                            paymentMethod === 'bkash'
                              ? settings.bkashNumber || '01800-000000'
                              : settings.nagadNumber || '01700-000000'
                          )
                        }
                        className="flex items-center gap-1 text-[11px] text-[#D32F2F] font-bold hover:underline cursor-pointer"
                      >
                        {copiedNumber ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedNumber ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    <div className="p-2 bg-white rounded border font-mono font-bold text-center text-gray-800">
                      {paymentMethod === 'bkash'
                        ? settings.bkashNumber || '01800-000000 (Merchant)'
                        : settings.nagadNumber || '01700-000000 (Merchant)'}
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-gray-700 block mb-1">
                        Enter Transaction ID (TrxID) *
                      </label>
                      <input
                        type="text"
                        required
                        value={transactionId}
                        onChange={e => setTransactionId(e.target.value.toUpperCase())}
                        placeholder="e.g. 9J4K28MLX1"
                        className="w-full text-xs p-2 bg-white border border-gray-200 rounded-lg uppercase tracking-wider font-mono focus:border-[#D32F2F]"
                      />
                    </div>
                  </div>
                )}

                {/* Order Summary Box */}
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>{t.subtotal} ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                    <span className="font-bold text-gray-800">{formatBDT(cartSubtotal)}</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>{t.deliveryCharge} ({deliveryZone === 'inside_dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'})</span>
                    <span className="font-bold">
                      {deliveryCharge === 0 ? (
                        <span className="text-green-600 font-bold">{t.free}</span>
                      ) : (
                        formatBDT(deliveryCharge)
                      )}
                    </span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600 font-bold">
                      <span>Discount</span>
                      <span>-{formatBDT(discountAmount)}</span>
                    </div>
                  )}

                  {isFreeDeliveryQualified && (
                    <div className="flex items-center gap-1 text-[11px] text-green-700 font-bold bg-green-50 p-1.5 rounded-lg">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0" />
                      <span>Free Home Delivery Applied!</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm font-black text-gray-900 pt-2 border-t border-gray-200">
                    <span>{t.total}</span>
                    <span className="text-[#D32F2F] text-base">{formatBDT(cartTotal)}</span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-bold py-3.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-500/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Processing Order...</span>
                  ) : (
                    <>
                      <span>{t.confirmOrder} ({formatBDT(cartTotal)})</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
