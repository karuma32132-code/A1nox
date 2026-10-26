import React from 'react';
import { useStore } from '../context/StoreContext';
import {
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { language, settings, setIsAdminOpen, setIsTrackingOpen } = useStore();

  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-24 lg:pb-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4">
        {/* Top Feature Highlights Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-10 border-b border-gray-800 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-800 text-[#D32F2F] flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white">Free Home Delivery</h4>
              <p className="text-gray-400 text-[11px]">On orders over ৳1,000</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-800 text-[#D32F2F] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white">100% Authentic</h4>
              <p className="text-gray-400 text-[11px]">Guaranteed genuine products</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-800 text-[#D32F2F] flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white">7-Day Easy Return</h4>
              <p className="text-gray-400 text-[11px]">Hassle-free replacement</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-800 text-[#D32F2F] flex items-center justify-center shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white">24/7 Dedicated Support</h4>
              <p className="text-gray-400 text-[11px]">Call or message anytime</p>
            </div>
          </div>
        </div>

        {/* Links and Company Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 py-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#D32F2F] flex items-center justify-center text-white font-black text-lg">
                A1
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                A1<span className="text-[#D32F2F]">NOXHUB</span>
              </span>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
              {language === 'bn'
                ? 'A1NOXHUB — বাংলাদেশের নির্ভরযোগ্য প্রিমিয়াম অনলাইন শপিং প্ল্যাটফর্ম। গ্যাজেটস, ফ্যাশন এবং হোম অ্যাপ্লায়েন্সের সেরা সম্ভার।'
                : 'A1NOXHUB is Bangladesh’s premier multi-category e-commerce platform offering top brands, guaranteed authenticity, fast delivery across 64 districts, and friendly customer care.'}
            </p>

            <div className="space-y-2 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#D32F2F] shrink-0" />
                <span>Gulshan-2, Dhaka 1212, Bangladesh</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#D32F2F] shrink-0" />
                <span className="font-mono">{settings.contactPhone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#D32F2F] shrink-0" />
                <span>{settings.contactEmail}</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase text-white tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><a href="#deals" className="hover:text-white transition">Deals & Offers</a></li>
              <li><a href="#trending" className="hover:text-white transition">Trending Gadgets</a></li>
              <li>
                <button
                  onClick={() => setIsTrackingOpen(true)}
                  className="hover:text-white transition cursor-pointer text-left"
                >
                  Order Tracking
                </button>
              </li>
              <li>
                <button
                  onClick={() => setIsAdminOpen(true)}
                  className="hover:text-red-400 transition cursor-pointer text-left font-medium text-slate-300 flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-red-500" />
                  <span>Admin Dashboard</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase text-white tracking-wider">
              Customer Care
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><a href="#terms" className="hover:text-white transition">Terms & Conditions</a></li>
              <li><a href="#privacy" className="hover:text-white transition">Privacy Policy</a></li>
              <li><a href="#shipping" className="hover:text-white transition">Shipping & Delivery Info</a></li>
              <li><a href="#refund" className="hover:text-white transition">Return & Refund Policy</a></li>
              <li><a href="#faq" className="hover:text-white transition">FAQ & Help Center</a></li>
            </ul>
          </div>

          {/* Bangladesh Payment Partners */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase text-white tracking-wider">
              Accepted Payments
            </h4>
            <p className="text-xs text-gray-400">
              Secure payments powered by official Bangladesh mobile banking and cards.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="bg-white/10 text-white font-bold text-[10px] px-2.5 py-1 rounded">
                Cash on Delivery
              </span>
              <span className="bg-[#E2136E] text-white font-bold text-[10px] px-2.5 py-1 rounded">
                bKash
              </span>
              <span className="bg-[#F7941D] text-white font-bold text-[10px] px-2.5 py-1 rounded">
                Nagad
              </span>
              <span className="bg-blue-600 text-white font-bold text-[10px] px-2.5 py-1 rounded">
                Visa
              </span>
              <span className="bg-red-600 text-white font-bold text-[10px] px-2.5 py-1 rounded">
                Mastercard
              </span>
            </div>
          </div>
        </div>

        {/* Bottom copyright & domain verification bar */}
        <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} A1NOXHUB (a1noxhub.com). All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Official Domain: <strong>a1noxhub.com</strong></span>
            <span>•</span>
            <span>Currency: <strong>BDT (৳)</strong></span>
          </div>
        </div>
      </div>
    </footer>
  );
};
