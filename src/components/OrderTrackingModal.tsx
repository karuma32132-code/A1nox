import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { formatBDT } from '../utils/translations';
import { Order } from '../types';
import { getOrderByIdFromDB, subscribeToOrderInDB } from '../firebase/firestore';
import {
  X,
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Phone,
  MessageCircle,
  Copy,
  Check,
  RefreshCw,
  MapPin,
  CreditCard,
  Radio,
  ExternalLink,
  ChevronRight,
  Shield,
} from 'lucide-react';

export const OrderTrackingModal: React.FC = () => {
  const { isTrackingOpen, setIsTrackingOpen, orders, language, t } = useStore();

  const [orderIdInput, setOrderIdInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [lastCheckedAt, setLastCheckedAt] = useState<string>('');

  // Unsubscribe ref for Firestore onSnapshot listener
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Auto-fill recent order details from localStorage when opening
  useEffect(() => {
    if (isTrackingOpen) {
      const recentId = localStorage.getItem('a1nox_last_order_id');
      const recentPhone = localStorage.getItem('a1nox_last_order_phone');
      if (recentId && !orderIdInput) {
        setOrderIdInput(recentId);
      }
      if (recentPhone && !phoneInput) {
        setPhoneInput(recentPhone);
      }
    } else {
      // Clean up Firestore real-time listener when modal closes
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      setIsLiveConnected(false);
    }
  }, [isTrackingOpen]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  if (!isTrackingOpen) return null;

  const normalizePhone = (p: string) => {
    return p.replace(/\D/g, '').slice(-11);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const cleanOrderId = orderIdInput.trim().toUpperCase();
    const cleanPhone = phoneInput.trim();

    if (!cleanOrderId) {
      setErrorMessage(
        language === 'bn' ? 'অনুগ্রহ করে অর্ডার আইডি প্রদান করুন।' : 'Please enter your Order ID.'
      );
      return;
    }

    if (!cleanPhone || cleanPhone.replace(/\D/g, '').length < 10) {
      setErrorMessage(
        language === 'bn'
          ? 'অনুগ্রহ করে সঠিক মোবাইল নম্বর প্রদান করুন (যেমন: 017XXXXXXXX)।'
          : 'Please enter a valid 11-digit phone number (e.g. 017XXXXXXXX).'
      );
      return;
    }

    setIsLoading(true);

    // Cancel any previous live subscription
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
      setIsLiveConnected(false);
    }

    try {
      // 1. Primary lookup: Query Firestore by Order ID
      let fetchedOrder: Order | null = null;

      try {
        fetchedOrder = await getOrderByIdFromDB(cleanOrderId);
      } catch (err) {
        console.warn('Firestore direct get status:', err);
      }

      // If not found with uppercase, try exact case
      if (!fetchedOrder && cleanOrderId !== orderIdInput.trim()) {
        try {
          fetchedOrder = await getOrderByIdFromDB(orderIdInput.trim());
        } catch (_) {}
      }

      // Fallback: Check local state/localStorage orders (for offline preview & demo orders)
      if (!fetchedOrder) {
        const localMatch = orders.find(
          o =>
            o.id.toUpperCase() === cleanOrderId ||
            o.orderNumber.toUpperCase() === cleanOrderId ||
            o.id.toUpperCase() === `ORD-${cleanOrderId}`
        );
        if (localMatch) {
          fetchedOrder = localMatch;
        }
      }

      if (!fetchedOrder) {
        setFoundOrder(null);
        setErrorMessage(
          language === 'bn'
            ? `"${cleanOrderId}" আইডি বিশিষ্ট কোনো অর্ডার খুঁজে পাওয়া যায়নি। অনুগ্রহ করে আপনার অর্ডার নম্বর যাচাই করুন।`
            : `No order found with Order ID "${cleanOrderId}". Please double-check your order number.`
        );
        setIsLoading(false);
        return;
      }

      // 2. Validate Phone Number against the retrieved order record
      const inputDigits = normalizePhone(cleanPhone);
      const recordDigits = normalizePhone(fetchedOrder.customerPhone);

      if (inputDigits !== recordDigits && !recordDigits.includes(inputDigits)) {
        setFoundOrder(null);
        setErrorMessage(
          language === 'bn'
            ? `প্রদত্ত মোবাইল নম্বর (${cleanPhone}) এই অর্ডারের রেকর্ডের সাথে মিলছে না। অনুগ্রহ করে সঠিক নম্বরটি দিন।`
            : `The phone number provided (${cleanPhone}) does not match the records for Order "${cleanOrderId}". Please verify your phone number.`
        );
        setIsLoading(false);
        return;
      }

      // 3. Match confirmed! Set order details & attach real-time Firestore listener
      setFoundOrder(fetchedOrder);
      setLastCheckedAt(new Date().toLocaleTimeString());

      // Attach Firestore real-time onSnapshot listener so status changes sync immediately
      try {
        const unsub = subscribeToOrderInDB(
          fetchedOrder.id,
          updatedOrder => {
            if (updatedOrder) {
              setFoundOrder(updatedOrder);
              setLastCheckedAt(new Date().toLocaleTimeString());
              setIsLiveConnected(true);
            }
          },
          err => {
            console.warn('Live subscription error, relying on fetched state:', err);
            setIsLiveConnected(false);
          }
        );
        unsubscribeRef.current = unsub;
        setIsLiveConnected(true);
      } catch (subErr) {
        console.warn('Could not establish real-time listener:', subErr);
        setIsLiveConnected(false);
      }
    } catch (err: any) {
      console.error('Order tracking lookup error:', err);
      setErrorMessage(
        language === 'bn'
          ? 'অর্ডার তথ্য আনতে সমস্যা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।'
          : 'Unable to fetch order status. Please check your network and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyOrderId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleResetSearch = () => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    setFoundOrder(null);
    setErrorMessage('');
    setIsLiveConnected(false);
  };

  // 5-Step Shipping Timeline configuration
  const timelineStages = [
    {
      key: 'pending',
      title: language === 'bn' ? 'অর্ডার গ্রহণ' : 'Order Placed',
      desc: language === 'bn' ? 'অর্ডার সিস্টেমে গৃহীত হয়েছে' : 'Received in system',
      stepNum: 1,
    },
    {
      key: 'confirmed',
      title: language === 'bn' ? 'কনফার্মেশন' : 'Order Confirmed',
      desc: language === 'bn' ? 'ফোনে কল করে যাচাই সম্পন্ন' : 'Customer verified by phone',
      stepNum: 2,
    },
    {
      key: 'processing',
      title: language === 'bn' ? 'প্যাকেজিং' : 'Processing & Packing',
      desc: language === 'bn' ? 'কোয়ালিটি চেক ও পার্সেল প্রস্তুত' : 'Quality checked at warehouse',
      stepNum: 3,
    },
    {
      key: 'shipped',
      title: language === 'bn' ? 'কুরিয়ারে হস্তান্তর' : 'Out for Delivery',
      desc: language === 'bn' ? 'ডেলিভারি রাইডারের কাছে হস্তান্তর' : 'In transit with courier',
      stepNum: 4,
    },
    {
      key: 'delivered',
      title: language === 'bn' ? 'ডেলিভারি সম্পন্ন' : 'Delivered',
      desc: language === 'bn' ? 'গ্রাহক পণ্য বুঝে পেয়েছেন' : 'Handed over to customer',
      stepNum: 5,
    },
  ];

  const getActiveStepIndex = (status: Order['status']): number => {
    switch (status) {
      case 'pending':
        return 0;
      case 'confirmed':
        return 1;
      case 'processing':
        return 2;
      case 'shipped':
        return 3;
      case 'delivered':
        return 4;
      case 'cancelled':
      case 'returned':
        return -1;
      default:
        return 0;
    }
  };

  const activeStepIdx = foundOrder ? getActiveStepIndex(foundOrder.status) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-gray-100 my-auto overflow-hidden relative">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#D32F2F] to-[#991B1B] text-white p-5 sm:p-6 relative">
          <button
            onClick={() => {
              setIsTrackingOpen(false);
              handleResetSearch();
            }}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center text-white backdrop-blur-xs shadow-inner">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded">
                  {language === 'bn' ? 'রিয়েল-টাইম ট্র্যাকিং' : 'Real-Time Firestore Tracking'}
                </span>
                {isLiveConnected && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-500/30 text-emerald-100 border border-emerald-400/30 px-2 py-0.5 rounded-full animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300"></span>
                    Live Sync
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-black mt-1">
                {language === 'bn' ? 'অর্ডার ট্র্যাকিং' : 'Track Your Shipment'}
              </h2>
              <p className="text-xs text-white/85">
                {language === 'bn'
                  ? 'আপনার অর্ডার আইডি ও ফোন নম্বর দিয়ে লাইভ স্ট্যাটাস দেখুন'
                  : 'Enter your Order ID and phone number to fetch live status'}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 max-h-[82vh] overflow-y-auto space-y-6">
          {/* Tracking Form (Shown when no order is displayed or for quick re-search) */}
          {!foundOrder ? (
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="space-y-3">
                {/* Order ID Input */}
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">
                    {language === 'bn' ? 'অর্ডার আইডি / নম্বর *' : 'Order ID or Order Number *'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={orderIdInput}
                      onChange={e => setOrderIdInput(e.target.value)}
                      placeholder="e.g. A1N-2026-1024 or ord-sample-01"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-mono focus:outline-none focus:border-[#D32F2F] focus:bg-white transition"
                    />
                    <Package className="w-4 h-4 text-gray-400 absolute right-3.5 top-3" />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    {language === 'bn'
                      ? 'অর্ডার কনফার্মেশনের সময় প্রাপ্ত আইডি (যেমন: A1N-2026-XXXX)'
                      : 'Found on your order confirmation screen or SMS'}
                  </p>
                </div>

                {/* Customer Phone Input */}
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">
                    {language === 'bn' ? 'অর্ডারে ব্যবহৃত মোবাইল নম্বর *' : 'Customer Phone Number *'}
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={phoneInput}
                      onChange={e => setPhoneInput(e.target.value)}
                      placeholder="e.g. 01712345678"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium focus:outline-none focus:border-[#D32F2F] focus:bg-white transition"
                    />
                    <Phone className="w-4 h-4 text-gray-400 absolute right-3.5 top-3" />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    {language === 'bn'
                      ? 'চেকআউটের সময় যে ১১ ডিজিটের নম্বর দিয়েছিলেন'
                      : 'The 11-digit Bangladesh phone number provided during checkout'}
                  </p>
                </div>
              </div>

              {/* Error Message Display */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">
                      {language === 'bn' ? 'যাচাই ব্যর্থ হয়েছে' : 'Verification Notice'}
                    </span>
                    <p className="mt-0.5 leading-relaxed">{errorMessage}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#D32F2F] hover:bg-[#B71C1C] disabled:bg-gray-300 text-white font-bold py-3 px-6 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>
                      {language === 'bn' ? 'ফায়ারস্টোরে খোঁজা হচ্ছে...' : 'Querying Firestore Database...'}
                    </span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>
                      {language === 'bn' ? 'রিয়েল-টাইম স্ট্যাটাস দেখুন' : 'Fetch Real-Time Status'}
                    </span>
                  </>
                )}
              </button>

              {/* Quick Demo Autofill Helpers */}
              <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-500">
                <span className="text-gray-400 font-medium">Quick Demo Test:</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setOrderIdInput('A1N-9021');
                      setPhoneInput('01712345678');
                      setErrorMessage('');
                    }}
                    className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-mono font-medium transition cursor-pointer"
                  >
                    Sample Order 1
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOrderIdInput('A1N-9022');
                      setPhoneInput('01898765432');
                      setErrorMessage('');
                    }}
                    className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-mono font-medium transition cursor-pointer"
                  >
                    Sample Order 2
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* Live Verified Order Tracking View */
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Order Status Header Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 relative overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      {language === 'bn' ? 'অর্ডার নম্বর' : 'Tracking Order'}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-base sm:text-lg font-black text-gray-900">
                        {foundOrder.orderNumber || foundOrder.id}
                      </span>
                      <button
                        onClick={() => handleCopyOrderId(foundOrder.orderNumber || foundOrder.id)}
                        className="text-gray-400 hover:text-gray-700 p-1 rounded hover:bg-gray-200 transition cursor-pointer"
                        title="Copy Order ID"
                      >
                        {copiedId ? (
                          <Check className="w-3.5 h-3.5 text-green-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-block text-xs font-black uppercase px-3 py-1 rounded-full ${
                        foundOrder.status === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : foundOrder.status === 'shipped'
                          ? 'bg-purple-100 text-purple-800 border border-purple-300'
                          : foundOrder.status === 'processing'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : foundOrder.status === 'confirmed'
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : foundOrder.status === 'cancelled'
                          ? 'bg-red-100 text-red-800 border border-red-300'
                          : 'bg-gray-100 text-gray-800 border border-gray-300'
                      }`}
                    >
                      {foundOrder.status}
                    </span>
                    {isLiveConnected && (
                      <span className="block text-[10px] text-emerald-600 font-bold mt-1">
                        ● Live Sync ({lastCheckedAt || 'Connected'})
                      </span>
                    )}
                  </div>
                </div>

                {/* Customer Verification Badge */}
                <div className="pt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-gray-400 block">Customer</span>
                    <span className="font-bold text-gray-800 truncate block">
                      {foundOrder.customerName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block">Verified Mobile</span>
                    <span className="font-bold text-gray-800 truncate block">
                      {foundOrder.customerPhone}
                    </span>
                  </div>
                </div>
              </div>

              {/* 5-Step Visual Shipping Timeline */}
              {foundOrder.status === 'cancelled' || foundOrder.status === 'returned' ? (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-center space-y-1">
                  <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-1" />
                  <h4 className="font-black text-sm text-red-900 capitalize">
                    Order {foundOrder.status}
                  </h4>
                  <p className="text-xs text-red-700">
                    This order was marked as {foundOrder.status}. If you have any inquiries, please
                    contact our support team.
                  </p>
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs">
                  <h4 className="text-xs font-black uppercase text-gray-500 tracking-wider">
                    {language === 'bn' ? 'শিপিং টাইমলাইন' : 'Live Shipment Progress'}
                  </h4>

                  {/* Progress Line & Steps */}
                  <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                    {timelineStages.map((stage, idx) => {
                      const isCompleted = activeStepIdx >= idx;
                      const isCurrent = activeStepIdx === idx;

                      return (
                        <div key={stage.key} className="relative flex items-start gap-3 text-left">
                          {/* Dot / Icon */}
                          <div
                            className={`absolute -left-6 sm:-left-8 w-6 sm:w-8 h-6 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                              isCurrent
                                ? 'bg-[#D32F2F] text-white ring-4 ring-red-100 animate-pulse'
                                : isCompleted
                                ? 'bg-emerald-600 text-white'
                                : 'bg-gray-100 text-gray-400 border border-gray-200'
                            }`}
                          >
                            {isCompleted ? (
                              <Check className="w-3.5 h-3.5" />
                            ) : (
                              <span>{stage.stepNum}</span>
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span
                                className={`text-xs sm:text-sm font-bold ${
                                  isCurrent
                                    ? 'text-[#D32F2F]'
                                    : isCompleted
                                    ? 'text-gray-900'
                                    : 'text-gray-400'
                                }`}
                              >
                                {stage.title}
                              </span>
                              {isCurrent && (
                                <span className="text-[10px] font-bold uppercase text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                                  Current Status
                                </span>
                              )}
                            </div>
                            <p
                              className={`text-[11px] mt-0.5 ${
                                isCompleted ? 'text-gray-500' : 'text-gray-400'
                              }`}
                            >
                              {stage.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Delivery ETA & Details Box */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 text-xs space-y-3">
                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-900 block">
                      {language === 'bn' ? 'আনুমানিক ডেলিভারি সময়' : 'Estimated Delivery Window'}
                    </span>
                    <p className="text-amber-800 text-[11px] mt-0.5">
                      {foundOrder.deliveryZone === 'inside_dhaka'
                        ? 'Inside Dhaka: Within 24 - 48 Hours via Express Courier'
                        : 'Outside Dhaka: 48 - 72 Hours via District Delivery Partner (Steadfast/Pathao)'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 pt-2 border-t border-amber-200/60">
                  <MapPin className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-900 block">
                      {language === 'bn' ? 'গন্তব্য ঠিকানা' : 'Destination Address'}
                    </span>
                    <p className="text-amber-800 text-[11px] mt-0.5">
                      {foundOrder.deliveryAddress}, {foundOrder.district || 'Dhaka'} (
                      <span className="capitalize">{foundOrder.deliveryZone.replace('_', ' ')}</span>)
                    </p>
                  </div>
                </div>
              </div>

              {/* Ordered Items List */}
              <div className="border border-gray-200 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <span className="text-xs font-bold text-gray-800">
                    Ordered Items ({foundOrder.items.length})
                  </span>
                  <span className="text-xs font-bold text-[#D32F2F]">
                    Total: {formatBDT(foundOrder.total)}
                  </span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {foundOrder.items.map((it, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl text-xs"
                    >
                      <img
                        src={
                          it.image ||
                          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'
                        }
                        alt={it.productTitle}
                        className="w-10 h-10 object-contain rounded-lg bg-white border border-gray-200 p-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800 truncate">{it.productTitle}</p>
                        <p className="text-[10px] text-gray-500">
                          Qty: {it.quantity} {it.color ? `• Color: ${it.color}` : ''}
                        </p>
                      </div>
                      <span className="font-bold text-gray-900">
                        {formatBDT(it.price * it.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-gray-100 grid grid-cols-2 gap-2 text-[11px] text-gray-600">
                  <div>
                    <span className="text-gray-400 block">Payment Method:</span>
                    <span className="font-bold text-gray-800 uppercase">
                      {foundOrder.paymentMethod} ({foundOrder.paymentStatus})
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-400 block">Order Date:</span>
                    <span className="font-medium text-gray-800">
                      {new Date(foundOrder.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  onClick={handleResetSearch}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'অন্য অর্ডার ট্র্যাক করুন' : 'Track Another Order'}</span>
                </button>
                <a
                  href="tel:01712345678"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'সাপোর্টে কল করুন' : 'Call Courier Support'}</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
