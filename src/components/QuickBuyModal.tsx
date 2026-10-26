import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { formatBDT } from '../utils/translations';
import { DeliveryZone, PaymentMethod, Order } from '../types';
import {
  X,
  Zap,
  Truck,
  CreditCard,
  Copy,
  Check,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Plus,
  Minus,
  AlertCircle,
  Clock,
  PhoneCall,
  MapPin,
  ChevronRight,
} from 'lucide-react';

export const QuickBuyModal: React.FC = () => {
  const {
    quickBuyProduct,
    closeQuickBuy,
    settings,
    submitOrder,
    currentUser,
    setIsTrackingOpen,
    language,
    t,
  } = useStore();

  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZone>('inside_dhaka');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [district, setDistrict] = useState('Dhaka');
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [transactionId, setTransactionId] = useState('');
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [formError, setFormError] = useState('');

  // Sync state when quickBuyProduct changes
  useEffect(() => {
    if (quickBuyProduct) {
      setQuantity(quickBuyProduct.quantity || 1);
      setSelectedColor(quickBuyProduct.color || quickBuyProduct.product.colors?.[0]);
      setCustomerName(currentUser?.displayName || '');
      setCustomerEmail(currentUser?.email || '');
      setFormError('');
      setCompletedOrder(null);
    }
  }, [quickBuyProduct, currentUser]);

  if (!quickBuyProduct) return null;

  const { product } = quickBuyProduct;

  // Price calculations
  const unitPrice = product.price;
  const subtotal = unitPrice * quantity;
  const isFreeDeliveryQualified = subtotal >= (settings.freeDeliveryThreshold || 1000);

  const baseDeliveryCharge =
    deliveryZone === 'inside_dhaka'
      ? settings.insideDhakaDeliveryFee || 60
      : settings.outsideDhakaDeliveryFee || 120;

  const deliveryCharge = isFreeDeliveryQualified ? 0 : baseDeliveryCharge;
  const total = subtotal + deliveryCharge;
  const amountNeededForFree = (settings.freeDeliveryThreshold || 1000) - subtotal;

  const handleCopyMerchantNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (product.inventory && next > product.inventory) return product.inventory;
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!customerName.trim()) {
      setFormError(language === 'bn' ? 'অনুগ্রহ করে আপনার নাম লিখুন।' : 'Please enter your full name.');
      return;
    }

    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 11) {
      setFormError(
        language === 'bn'
          ? 'অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর লিখুন (যেমন: 01712345678)।'
          : 'Please enter a valid 11-digit mobile number (e.g. 01712345678).'
      );
      return;
    }

    if (!deliveryAddress.trim()) {
      setFormError(
        language === 'bn'
          ? 'অনুগ্রহ করে সম্পূর্ণ ডেলিভারি ঠিকানা লিখুন।'
          : 'Please enter your complete delivery address.'
      );
      return;
    }

    if ((paymentMethod === 'bkash' || paymentMethod === 'nagad') && !transactionId.trim()) {
      setFormError(
        language === 'bn'
          ? 'অনুগ্রহ করে বিকাশ/নগদ এসএমএস থেকে Transaction ID (TrxID) লিখুন।'
          : 'Please enter the Transaction ID (TrxID) from your bKash/Nagad SMS.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const orderItems = [
        {
          productId: product.id,
          productTitle: language === 'bn' ? product.titleBn : product.title,
          price: product.price,
          quantity,
          image: product.images[0],
          color: selectedColor,
        },
      ];

      // Submit without clearing regular cart
      const newOrder = await submitOrder(
        {
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail.trim() || undefined,
          deliveryAddress: deliveryAddress.trim(),
          district,
          deliveryZone,
          subtotal,
          deliveryCharge,
          discount: 0,
          total,
          paymentMethod,
          paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
          transactionId: transactionId.trim() || undefined,
          status: 'pending',
          items: orderItems,
          notes: orderNotes.trim() ? `[Quick Buy] ${orderNotes.trim()}` : '[Quick Buy 1-Step Checkout]',
        },
        false // Keep existing cart intact!
      );

      setCompletedOrder(newOrder);
    } catch (err) {
      setFormError(
        language === 'bn'
          ? 'অর্ডার প্রক্রিয়া সম্পন্ন করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।'
          : 'An error occurred while confirming your order. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-gray-100 my-auto relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#D32F2F] to-[#B71C1C] text-white p-4 sm:p-5 relative">
          <button
            onClick={closeQuickBuy}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-400 text-gray-900 text-[10px] font-black px-2 py-0.5 rounded uppercase flex items-center gap-1 shadow-xs">
              <Zap className="w-3 h-3 fill-gray-900" />
              1-Step Express
            </span>
            <div className="flex items-center gap-1 text-[11px] text-white/90 font-medium">
              <Lock className="w-3 h-3" />
              <span>100% Safe & Secure</span>
            </div>
          </div>

          <h2 className="text-lg sm:text-xl font-black">
            {language === 'bn' ? 'দ্রুত অর্ডার করুন' : 'Quick 1-Step Checkout'}
          </h2>
          <p className="text-xs text-white/85">
            {language === 'bn'
              ? 'পণ্যটি পেতে নিচের তথ্যগুলো পূরণ করে অর্ডার কনফার্ম করুন'
              : 'Fill in your details below to place your order in 30 seconds'}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 max-h-[80vh] overflow-y-auto space-y-5">
          {completedOrder ? (
            /* Order Success View */
            <div className="text-center py-4 space-y-4 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="inline-block bg-green-50 text-green-700 text-xs font-bold px-3 py-1 rounded-full border border-green-200 mb-2">
                  {language === 'bn' ? 'অর্ডার সফলভাবে গ্রহণ করা হয়েছে!' : 'Order Placed Successfully!'}
                </span>
                <h3 className="text-xl font-black text-gray-900">
                  {language === 'bn' ? 'ধন্যবাদ আপনার অর্ডারের জন্য!' : 'Thank You For Your Order!'}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {language === 'bn'
                    ? 'আমাদের কাস্টমার কেয়ার টিম শীঘ্রই ফোন করে অর্ডার নিশ্চিত করবে।'
                    : 'Our team will call you shortly to confirm delivery details.'}
                </p>
              </div>

              {/* Order Details Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2.5 text-xs text-gray-700">
                <div className="flex justify-between pb-2 border-b border-gray-200">
                  <span className="text-gray-500">{language === 'bn' ? 'অর্ডার নম্বর:' : 'Order Number:'}</span>
                  <span className="font-bold font-mono text-gray-900">{completedOrder.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{language === 'bn' ? 'পণ্য:' : 'Item:'}</span>
                  <span className="font-semibold text-gray-900 truncate max-w-[200px]">
                    {product.title} (x{quantity})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{language === 'bn' ? 'সর্বমোট প্রদেয়:' : 'Total Amount:'}</span>
                  <span className="font-black text-[#D32F2F] text-sm">{formatBDT(completedOrder.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{language === 'bn' ? 'পেমেন্ট মেথড:' : 'Payment:'}</span>
                  <span className="font-semibold uppercase">{completedOrder.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{language === 'bn' ? 'মোবাইল নম্বর:' : 'Phone:'}</span>
                  <span className="font-medium text-gray-800">{completedOrder.customerPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{language === 'bn' ? 'ডেলিভারি ঠিকানা:' : 'Address:'}</span>
                  <span className="font-medium text-gray-800 text-right max-w-[200px] truncate">
                    {completedOrder.deliveryAddress}, {completedOrder.district}
                  </span>
                </div>
              </div>

              {/* Delivery ETA info */}
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-left">
                <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                <div className="text-[11px] text-amber-900">
                  <p className="font-bold">
                    {language === 'bn' ? 'আনুমানিক ডেলিভারি সময়:' : 'Estimated Delivery Time:'}
                  </p>
                  <p>
                    {deliveryZone === 'inside_dhaka'
                      ? (language === 'bn' ? 'ঢাকার ভেতরে: ২৪-৪৮ ঘণ্টার মধ্যে' : 'Inside Dhaka: 24 - 48 Hours')
                      : (language === 'bn' ? 'ঢাকার বাইরে: ২-৩ কার্যদিবস' : 'Outside Dhaka: 2 - 3 Business Days')}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  onClick={() => {
                    closeQuickBuy();
                    setIsTrackingOpen(true);
                  }}
                  className="flex-1 bg-gray-900 hover:bg-black text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  {language === 'bn' ? 'অর্ডার ট্র্যাক করুন' : 'Track Order'}
                </button>
                <button
                  onClick={closeQuickBuy}
                  className="flex-1 bg-red-50 hover:bg-red-100 text-[#D32F2F] font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer border border-red-200"
                >
                  {language === 'bn' ? 'আরও কেনাকাটা করুন' : 'Continue Shopping'}
                </button>
              </div>
            </div>
          ) : (
            /* Order Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Product Snippet */}
              <div className="flex items-center gap-3.5 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="w-16 h-16 bg-white rounded-xl overflow-hidden shrink-0 border border-gray-200 p-1 flex items-center justify-center">
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                    {language === 'bn' ? product.titleBn : product.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-black text-[#D32F2F]">{formatBDT(unitPrice)}</span>
                    {product.salePrice && product.salePrice > product.price && (
                      <span className="text-xs text-gray-400 line-through">
                        {formatBDT(product.salePrice)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantity stepper */}
                <div className="flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden shrink-0 shadow-xs">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(-1)}
                    className="p-1.5 hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-2 text-xs font-bold text-gray-800 min-w-[24px] text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(1)}
                    className="p-1.5 hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Color Selection if product has colors */}
              {product.colors && product.colors.length > 0 && (
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    {language === 'bn' ? 'কালার বেছে নিন:' : 'Select Color:'}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all cursor-pointer ${
                          selectedColor === color
                            ? 'bg-[#D32F2F] text-white border-[#D32F2F] shadow-xs'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Delivery Zone Selector */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                    {language === 'bn' ? 'ডেলিভারি লোকেশন:' : 'Delivery Location:'}
                  </label>
                  {isFreeDeliveryQualified ? (
                    <span className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Check className="w-3 h-3 text-green-600" />
                      {language === 'bn' ? 'ফ্রি ডেলিভারি!' : 'Free Delivery!'}
                    </span>
                  ) : (
                    <span className="text-[10px] text-gray-500">
                      {language === 'bn'
                        ? `৳১,০০০+ অর্ডারে ফ্রি ডেলিভারি (বাকি ৳${amountNeededForFree.toLocaleString()})`
                        : `Free delivery over ৳1,000 (Add ৳${amountNeededForFree.toLocaleString()})`}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryZone('inside_dhaka')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      deliveryZone === 'inside_dhaka'
                        ? 'border-[#D32F2F] bg-red-50/60 ring-1 ring-[#D32F2F]'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <span className="text-xs font-bold text-gray-900">
                      {language === 'bn' ? 'ঢাকার ভেতরে' : 'Inside Dhaka'}
                    </span>
                    <span className="text-[11px] font-semibold mt-1">
                      {isFreeDeliveryQualified ? (
                        <span className="text-green-600 font-bold">FREE</span>
                      ) : (
                        <span className="text-gray-600">৳{settings.insideDhakaDeliveryFee || 60}</span>
                      )}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryZone('outside_dhaka')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      deliveryZone === 'outside_dhaka'
                        ? 'border-[#D32F2F] bg-red-50/60 ring-1 ring-[#D32F2F]'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <span className="text-xs font-bold text-gray-900">
                      {language === 'bn' ? 'ঢাকার বাইরে' : 'Outside Dhaka'}
                    </span>
                    <span className="text-[11px] font-semibold mt-1">
                      {isFreeDeliveryQualified ? (
                        <span className="text-green-600 font-bold">FREE</span>
                      ) : (
                        <span className="text-gray-600">৳{settings.outsideDhakaDeliveryFee || 120}</span>
                      )}
                    </span>
                  </button>
                </div>
              </div>

              {/* Customer Inputs */}
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {language === 'bn' ? 'আপনার নাম *' : 'Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder={language === 'bn' ? 'আপনার সম্পূর্ণ নাম লিখুন' : 'e.g. Arman Hossain'}
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-gray-200 rounded-xl focus:outline-hidden focus:border-[#D32F2F] focus:ring-1 focus:ring-[#D32F2F]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {language === 'bn' ? 'মোবাইল নম্বর (১১ ডিজিট) *' : 'Phone Number (11 Digits) *'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-gray-400 font-bold">🇧🇩 +88</span>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      placeholder="017XXXXXXXX"
                      className="w-full text-xs sm:text-sm pl-16 pr-3 py-2 border border-gray-200 rounded-xl focus:outline-hidden focus:border-[#D32F2F] focus:ring-1 focus:ring-[#D32F2F] font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {language === 'bn' ? 'সম্পূর্ণ ঠিকানা *' : 'Delivery Address *'}
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={deliveryAddress}
                    onChange={e => setDeliveryAddress(e.target.value)}
                    placeholder={
                      language === 'bn'
                        ? 'বাড়ি নম্বর, রোড নম্বর, এলাকা, থানা'
                        : 'House no, Road/Street, Sector/Area, Thana'
                    }
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-gray-200 rounded-xl focus:outline-hidden focus:border-[#D32F2F] focus:ring-1 focus:ring-[#D32F2F]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {language === 'bn' ? 'জেলা / এলাকা' : 'District / City'}
                    </label>
                    <select
                      value={district}
                      onChange={e => {
                        const val = e.target.value;
                        setDistrict(val);
                        if (val === 'Dhaka') {
                          setDeliveryZone('inside_dhaka');
                        } else {
                          setDeliveryZone('outside_dhaka');
                        }
                      }}
                      className="w-full text-xs px-2.5 py-2 border border-gray-200 rounded-xl focus:outline-hidden focus:border-[#D32F2F] bg-white font-medium text-gray-700"
                    >
                      <option value="Dhaka">Dhaka (ঢাকা)</option>
                      <option value="Chattogram">Chattogram (চট্টগ্রাম)</option>
                      <option value="Sylhet">Sylhet (সিলেট)</option>
                      <option value="Rajshahi">Rajshahi (রাজশাহী)</option>
                      <option value="Khulna">Khulna (খুলনা)</option>
                      <option value="Barishal">Barishal (বরিশাল)</option>
                      <option value="Rangpur">Rangpur (রংপুর)</option>
                      <option value="Mymensingh">Mymensingh (ময়মনসিংহ)</option>
                      <option value="Gazipur">Gazipur (গাজীপুর)</option>
                      <option value="Narayanganj">Narayanganj (নারায়ণগঞ্জ)</option>
                      <option value="Cumilla">Cumilla (কুমিল্লা)</option>
                      <option value="Bogura">Bogura (বগুড়া)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {language === 'bn' ? 'বিশেষ অনুরোধ (ঐচ্ছিক)' : 'Note (Optional)'}
                    </label>
                    <input
                      type="text"
                      value={orderNotes}
                      onChange={e => setOrderNotes(e.target.value)}
                      placeholder={language === 'bn' ? 'যেমন: কল করে আসবেন' : 'e.g. Call before delivery'}
                      className="w-full text-xs px-2.5 py-2 border border-gray-200 rounded-xl focus:outline-hidden focus:border-[#D32F2F]"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  {language === 'bn' ? 'পেমেন্ট মেথড:' : 'Payment Method:'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      paymentMethod === 'cod'
                        ? 'border-[#D32F2F] bg-red-50 text-[#D32F2F] font-bold ring-1 ring-[#D32F2F]'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 text-xs font-medium'
                    }`}
                  >
                    <span className="block text-[11px] font-black uppercase">COD</span>
                    <span className="text-[9px] block text-gray-500">
                      {language === 'bn' ? 'ক্যাশ অন ডেলিভারি' : 'Cash on Delivery'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bkash')}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      paymentMethod === 'bkash'
                        ? 'border-[#D12053] bg-pink-50 text-[#D12053] font-bold ring-1 ring-[#D12053]'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 text-xs font-medium'
                    }`}
                  >
                    <span className="block text-[11px] font-black text-[#D12053]">bKash</span>
                    <span className="text-[9px] block text-gray-500">
                      {language === 'bn' ? 'বিকাশ পেমেন্ট' : 'Mobile Banking'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('nagad')}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      paymentMethod === 'nagad'
                        ? 'border-[#F7941D] bg-orange-50 text-[#F7941D] font-bold ring-1 ring-[#F7941D]'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 text-xs font-medium'
                    }`}
                  >
                    <span className="block text-[11px] font-black text-[#F7941D]">Nagad</span>
                    <span className="text-[9px] block text-gray-500">
                      {language === 'bn' ? 'নগদ পেমেন্ট' : 'Mobile Banking'}
                    </span>
                  </button>
                </div>

                {/* bKash / Nagad Transaction Details */}
                {(paymentMethod === 'bkash' || paymentMethod === 'nagad') && (
                  <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">
                        {paymentMethod === 'bkash' ? 'bKash Merchant/Personal:' : 'Nagad Merchant/Personal:'}
                      </span>
                      <div className="flex items-center gap-1.5 font-bold font-mono text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-200">
                        <span>
                          {paymentMethod === 'bkash'
                            ? settings.bkashNumber || '01700000000'
                            : settings.nagadNumber || '01800000000'}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleCopyMerchantNumber(
                              paymentMethod === 'bkash'
                                ? settings.bkashNumber || '01700000000'
                                : settings.nagadNumber || '01800000000'
                            )
                          }
                          className="text-gray-400 hover:text-gray-700 cursor-pointer"
                          title="Copy Number"
                        >
                          {copiedNumber ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                        {language === 'bn'
                          ? 'টাকা পাঠানোর পর Transaction ID (TrxID) লিখুন *'
                          : 'Enter Transaction ID (TrxID) after payment *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={transactionId}
                        onChange={e => setTransactionId(e.target.value)}
                        placeholder="e.g. 9B8A7X6Y5Z"
                        className="w-full text-xs px-2.5 py-1.5 border border-gray-300 rounded-lg font-mono uppercase bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Price Calculation Card */}
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>{language === 'bn' ? 'পণ্যের মোট মূল্য:' : 'Item Subtotal:'}</span>
                  <span className="font-semibold text-gray-900">{formatBDT(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>{language === 'bn' ? 'ডেলিভারি চার্জ:' : 'Delivery Charge:'}</span>
                  <span className="font-semibold">
                    {deliveryCharge === 0 ? (
                      <span className="text-green-600 font-bold">{language === 'bn' ? 'ফ্রি' : 'FREE'}</span>
                    ) : (
                      formatBDT(deliveryCharge)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black text-gray-900 pt-1.5 border-t border-gray-200">
                  <span>{language === 'bn' ? 'সর্বমোট প্রদেয়:' : 'Total Payable:'}</span>
                  <span className="text-[#D32F2F] text-base">{formatBDT(total)}</span>
                </div>
              </div>

              {/* Error Banner */}
              {formError && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-extrabold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-white" />
                    <span>
                      {language === 'bn'
                        ? `অর্ডার কনফার্ম করুন — ${formatBDT(total)}`
                        : `Confirm Order — ${formatBDT(total)}`}
                    </span>
                  </>
                )}
              </button>

              {/* Trust Badges Footer */}
              <div className="grid grid-cols-3 gap-2 pt-1 text-[10px] text-gray-500 text-center">
                <div className="flex flex-col items-center gap-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                  <span>১০০% আসল পণ্য</span>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <Truck className="w-3.5 h-3.5 text-blue-600" />
                  <span>দ্রুত হোম ডেলিভারি</span>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <PhoneCall className="w-3.5 h-3.5 text-purple-600" />
                  <span>কল করে কনফার্মেশন</span>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
