import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import {
  ChevronRight,
  ChevronLeft,
  Headphones,
  Shirt,
  Sparkles,
  Home,
  Smartphone,
  Activity,
  Watch,
  Smile,
  Car,
  BookOpen,
  ArrowRight,
} from 'lucide-react';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  electronics: <Headphones className="w-4 h-4" />,
  fashion: <Shirt className="w-4 h-4" />,
  beauty: <Sparkles className="w-4 h-4" />,
  home: <Home className="w-4 h-4" />,
  gadgets: <Smartphone className="w-4 h-4" />,
  sports: <Activity className="w-4 h-4" />,
  accessories: <Watch className="w-4 h-4" />,
  toys: <Smile className="w-4 h-4" />,
  automotive: <Car className="w-4 h-4" />,
  books: <BookOpen className="w-4 h-4" />,
};

const HERO_SLIDES = [
  {
    badge: 'LIMITED TIME OFFER',
    badgeBn: 'সীমিত সময়ের অফার',
    titleLine1: 'Latest Gadgets',
    titleLine1Bn: 'প্রিমিয়াম গ্যাজেটস',
    titleLine2: 'For A Smarter You',
    titleLine2Bn: 'স্মার্ট ও আধুনিক জীবনের জন্য',
    sub: 'Top brands • Best prices • Fast delivery',
    subBn: 'সেরা ব্র্যান্ড • সেরা দাম • দ্রুত ডেলিভারি',
    discount: 'UP TO 50% OFF',
    discountBn: 'সর্বোচ্চ ৫০% ছাড়',
    cta: 'Shop Now',
    ctaBn: 'এখনই কিনুন',
    categoryId: 'electronics',
    bgGradient: 'from-gray-50 via-red-50/20 to-gray-100',
    accentColor: '#D32F2F',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
  },
  {
    badge: 'TOP PICKS',
    badgeBn: 'জনপ্রিয় কালেকশন',
    titleLine1: 'Top Picks',
    titleLine1Bn: 'সেরা লাইফস্টাইল',
    titleLine2: 'For Your Lifestyle',
    titleLine2Bn: 'পোশাক ও ফ্যাশন সম্ভার',
    sub: 'Premium products, better living',
    subBn: 'প্রিমিয়াম কোয়ালিটি, আধুনিক স্টাইল',
    discount: 'UP TO 40% OFF',
    discountBn: 'সর্বোচ্চ ৪০% ছাড়',
    cta: 'Explore Deals',
    ctaBn: 'অফারগুলো দেখুন',
    categoryId: 'fashion',
    bgGradient: 'from-amber-50/40 via-red-50/20 to-orange-50/30',
    accentColor: '#E65100',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
  },
  {
    badge: 'NEW ARRIVALS 2026',
    badgeBn: 'নতুন আগমনী ২০২৬',
    titleLine1: 'Active Lifestyle',
    titleLine1Bn: 'স্পোর্টস ও রানিং গিয়ার',
    titleLine2: 'Unleash Your Energy',
    titleLine2Bn: 'চমৎকার ফিটনেস অফার',
    sub: 'Original sports gear with official warranty',
    subBn: '১০০% অরিজিনাল পণ্য ও ক্যাশ অন ডেলিভারি',
    discount: 'SPECIAL OFFER',
    discountBn: 'বিশেষ মূল্যছাড়',
    cta: 'View Collection',
    ctaBn: 'কালেকশন দেখুন',
    categoryId: 'sports',
    bgGradient: 'from-emerald-50/30 via-slate-50 to-blue-50/20',
    accentColor: '#059669',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
  },
];

export const HeroSection: React.FC = () => {
  const { categories, language, setSelectedCategory, setActiveNavTab } = useStore();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto rotate banner every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = HERO_SLIDES[currentSlide];

  const handleSlideCta = () => {
    setSelectedCategory(slide.categoryId);
    setActiveNavTab('category');
    window.scrollTo({ top: 500, behavior: 'smooth' });
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setActiveNavTab('category');
    window.scrollTo({ top: 500, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
        {/* Left Sidebar Category Menu (Desktop) */}
        <div className="hidden lg:block bg-white rounded-2xl border border-gray-100 shadow-sm p-3 self-stretch flex flex-col justify-between">
          <div className="space-y-0.5">
            {categories.slice(0, 8).map(cat => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-gray-700 hover:text-[#D32F2F] hover:bg-red-50 text-xs font-semibold transition-all group cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 group-hover:text-[#D32F2F] transition-colors">
                    {CATEGORY_ICONS[cat.id] || <Sparkles className="w-4 h-4" />}
                  </span>
                  <span>{language === 'bn' ? cat.nameBn : cat.name}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#D32F2F] group-hover:translate-x-0.5 transition-all" />
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-gray-100 mt-2">
            <button
              onClick={() => {
                setSelectedCategory(null);
                setActiveNavTab('all_categories');
              }}
              className="w-full text-center py-2 text-xs font-bold text-[#D32F2F] hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            >
              {language === 'bn' ? 'সব ক্যাটাগরি দেখুন →' : 'View All Categories →'}
            </button>
          </div>
        </div>

        {/* Main Hero Slider Banner */}
        <div className="lg:col-span-3 relative rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-gradient-to-r from-red-50/60 via-white to-gray-50 flex items-center min-h-[300px] sm:min-h-[380px] lg:min-h-[420px]">
          {/* Background decorative wave / glow */}
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-red-100/40 blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-orange-100/30 blur-3xl pointer-events-none" />

          {/* Banner Content Grid */}
          <div className="relative z-10 w-full px-6 sm:px-12 py-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Left Text */}
            <div className="md:col-span-7 space-y-3 sm:space-y-4 text-left">
              <span className="inline-block bg-[#D32F2F] text-white text-[11px] sm:text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
                {language === 'bn' ? slide.badgeBn : slide.badge}
              </span>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-tight">
                {language === 'bn' ? slide.titleLine1Bn : slide.titleLine1}
                <br />
                <span className="text-[#D32F2F]">
                  {language === 'bn' ? slide.titleLine2Bn : slide.titleLine2}
                </span>
              </h1>

              <p className="text-xs sm:text-sm text-gray-600 font-medium max-w-md">
                {language === 'bn' ? slide.subBn : slide.sub}
              </p>

              <div className="pt-2">
                <button
                  onClick={handleSlideCta}
                  className="bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-full flex items-center gap-2 shadow-lg shadow-red-500/25 hover:shadow-xl hover:gap-3 transition-all cursor-pointer group"
                >
                  <span>{language === 'bn' ? slide.ctaBn : slide.cta}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Right Product Showcase & Discount Badge */}
            <div className="md:col-span-5 relative flex items-center justify-center">
              {/* Floating "UP TO 50% OFF" badge */}
              <div className="absolute top-2 right-2 sm:-top-2 sm:right-6 bg-gradient-to-br from-[#D32F2F] to-[#B71C1C] text-white w-18 h-18 sm:w-22 sm:h-22 rounded-full flex flex-col items-center justify-center shadow-xl border-2 border-white transform rotate-6 z-20 animate-pulse">
                <span className="text-[9px] font-bold tracking-tight">UP TO</span>
                <span className="text-sm sm:text-lg font-black leading-none">50%</span>
                <span className="text-[9px] font-bold">OFF</span>
              </div>

              {/* Product hero image */}
              <div className="relative w-56 h-56 sm:w-72 sm:h-72 lg:w-80 lg:h-80 flex items-center justify-center">
                <img
                  src={slide.image}
                  alt={slide.titleLine1}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-contain filter drop-shadow-2xl transform hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>

          {/* Slider Prev / Next Controls */}
          <button
            onClick={() =>
              setCurrentSlide(prev => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)
            }
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-gray-700 shadow-md flex items-center justify-center transition-all cursor-pointer z-20 hover:scale-110"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-gray-700 shadow-md flex items-center justify-center transition-all cursor-pointer z-20 hover:scale-110"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Slider Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  currentSlide === i ? 'w-6 bg-[#D32F2F]' : 'w-2 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
