import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { ToastProvider } from './context/ToastContext';
import { ToastContainer } from './components/ToastContainer';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { ValueProps } from './components/ValueProps';
import { TrendingCategories } from './components/TrendingCategories';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { QuickBuyModal } from './components/QuickBuyModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Footer } from './components/Footer';
import {
  ProductGridSkeleton,
  CategoryBannerSkeleton,
} from './components/skeletons/StorefrontSkeletons';
import {
  Flame,
  Award,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle,
  Truck,
  Heart,
  Search as SearchIcon,
  ShoppingBag,
  Send,
} from 'lucide-react';

const StoreContent: React.FC = () => {
  const {
    products,
    categories,
    activeNavTab,
    setActiveNavTab,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    wishlist,
    language,
    isLoading,
    setIsAdminOpen,
    t,
  } = useStore();

  // Direct Admin URL Route Protection Check
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (
      urlParams.get('view') === 'admin' ||
      urlParams.get('admin') === 'true' ||
      window.location.pathname === '/admin' ||
      window.location.pathname.startsWith('/admin/') ||
      window.location.hash === '#admin'
    ) {
      setIsAdminOpen(true);
    }
  }, [setIsAdminOpen]);

  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('All');
  const [priceSort, setPriceSort] = useState<'default' | 'low_to_high' | 'high_to_low'>('default');

  // Active Category info
  const currentCategoryObj = categories.find(c => c.id === selectedCategory);

  // Filtered Products
  let displayedProducts = [...products];

  if (activeNavTab === 'deals') {
    displayedProducts = displayedProducts.filter(p => p.isDeal || (p.salePrice && p.salePrice > p.price));
  } else if (activeNavTab === 'trending') {
    displayedProducts = displayedProducts.filter(p => p.isTrending);
  } else if (activeNavTab === 'best_sellers') {
    displayedProducts = displayedProducts.filter(p => p.isBestSeller);
  } else if (activeNavTab === 'new') {
    displayedProducts = displayedProducts.slice().reverse();
  } else if (activeNavTab === 'wishlist') {
    displayedProducts = displayedProducts.filter(p => wishlist.includes(p.id));
  } else if (activeNavTab === 'search') {
    const q = searchQuery.toLowerCase().trim();
    displayedProducts = displayedProducts.filter(
      p =>
        p.title.toLowerCase().includes(q) ||
        p.titleBn.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  } else if (activeNavTab === 'category' && selectedCategory) {
    displayedProducts = displayedProducts.filter(p => p.categoryId === selectedCategory);
    if (selectedSubcategory !== 'All') {
      displayedProducts = displayedProducts.filter(p => p.subcategory === selectedSubcategory);
    }
  }

  // Sort
  if (priceSort === 'low_to_high') {
    displayedProducts.sort((a, b) => a.price - b.price);
  } else if (priceSort === 'high_to_low') {
    displayedProducts.sort((a, b) => b.price - a.price);
  }

  // Featured slices for home page
  const dealProducts = products.filter(p => p.isDeal).slice(0, 4);
  const bestSellerProducts = products.filter(p => p.isBestSeller).slice(0, 4);
  const trendingProducts = products.filter(p => p.isTrending).slice(0, 4);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-gray-900 font-sans selection:bg-red-500 selection:text-white">
      {/* 1. Main Header */}
      <Header />

      {/* 2. Main Store View Body */}
      <main className="flex-1">
        {/* VIEW: HOME */}
        {activeNavTab === 'home' && (
          <div className="space-y-4 pb-12">
            {/* Hero Banner & Sidebar Menu */}
            <HeroSection />

            {/* 4 Value Proposition Cards */}
            <ValueProps />

            {/* Trending Categories Carousel with horizontal swipe */}
            <TrendingCategories />

            {/* Section 1: Flash Deals & Offers */}
            <section className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-red-100 text-[#D32F2F] flex items-center justify-center">
                    <Flame className="w-5 h-5 text-[#D32F2F] fill-[#D32F2F]" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight">
                      {t.dealsAndOffers}
                    </h2>
                    <p className="text-xs text-gray-500 font-medium hidden sm:block">
                      Limited-time price cuts on Bangladesh’s hottest products
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveNavTab('deals')}
                  className="text-xs sm:text-sm font-bold text-[#D32F2F] hover:text-[#B71C1C] flex items-center gap-1 transition cursor-pointer"
                >
                  <span>{t.seeAll}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {isLoading ? (
                <ProductGridSkeleton count={4} />
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
                  {dealProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </section>

            {/* Promotional Mid-Banner: Free Home Delivery Highlight */}
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="rounded-3xl bg-gradient-to-r from-[#D32F2F] via-[#C62828] to-[#991B1B] p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
                <div className="space-y-2 text-center md:text-left z-10">
                  <span className="bg-white/20 text-white font-extrabold text-[10px] sm:text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                    SPECIAL CAMPAIGN
                  </span>
                  <h3 className="text-xl sm:text-3xl font-black tracking-tight">
                    {language === 'bn'
                      ? '৳১,০০০ টাকার অর্ডারে ফ্রি হোম ডেলিভারি!'
                      : 'Free Home Delivery On All Orders Above ৳1,000!'}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/80 max-w-lg">
                    {language === 'bn'
                      ? 'ঢাকার ভেতরে এবং বাইরে ৬৪ জেলাতেই নির্ভরযোগ্য হোম ডেলিভারি এবং ক্যাশ অন ডেলিভারি সুবিধা।'
                      : 'Fast nationwide doorstep delivery with Cash on Delivery and bKash across all 64 districts.'}
                  </p>
                </div>

                <div className="z-10 shrink-0">
                  <button
                    onClick={() => setActiveNavTab('deals')}
                    className="bg-white hover:bg-gray-100 text-[#D32F2F] font-black text-xs sm:text-sm px-6 py-3.5 rounded-full shadow-lg transition-transform hover:scale-105 cursor-pointer"
                  >
                    {language === 'bn' ? 'অফারগুলো দেখুন →' : 'Shop Eligible Items →'}
                  </button>
                </div>
              </div>
            </div>

            {/* Section 2: Best Sellers */}
            <section className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                    <Award className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight">
                      {t.bestSellers}
                    </h2>
                    <p className="text-xs text-gray-500 font-medium hidden sm:block">
                      Top-rated items loved by thousands of happy customers
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveNavTab('best_sellers')}
                  className="text-xs sm:text-sm font-bold text-[#D32F2F] hover:text-[#B71C1C] flex items-center gap-1 transition cursor-pointer"
                >
                  <span>{t.seeAll}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {isLoading ? (
                <ProductGridSkeleton count={4} />
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
                  {bestSellerProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </section>

            {/* Section 3: Trending Products */}
            <section className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight">
                      {t.trending}
                    </h2>
                    <p className="text-xs text-gray-500 font-medium hidden sm:block">
                      Latest innovations and popular picks in Bangladesh
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveNavTab('trending')}
                  className="text-xs sm:text-sm font-bold text-[#D32F2F] hover:text-[#B71C1C] flex items-center gap-1 transition cursor-pointer"
                >
                  <span>{t.seeAll}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {isLoading ? (
                <ProductGridSkeleton count={4} />
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
                  {trendingProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* VIEW: CATEGORY / SUB-CATEGORY PAGE (Matching Reference Image 2) */}
        {(activeNavTab === 'category' || activeNavTab === 'all_categories') && (
          <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <button
                onClick={() => setActiveNavTab('home')}
                className="hover:text-[#D32F2F] font-medium cursor-pointer"
              >
                Home
              </button>
              <span>›</span>
              <span className="font-bold text-gray-800">
                {currentCategoryObj
                  ? language === 'bn'
                    ? currentCategoryObj.nameBn
                    : currentCategoryObj.name
                  : t.allCategories}
              </span>
            </div>

            {/* Category Promo Hero Banner */}
            <div className="rounded-3xl bg-gradient-to-r from-red-600 to-red-800 text-white p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md relative overflow-hidden">
              <div className="space-y-2 text-center sm:text-left z-10">
                <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                  Featured Category
                </span>
                <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
                  {currentCategoryObj
                    ? language === 'bn'
                      ? currentCategoryObj.nameBn
                      : currentCategoryObj.name
                    : 'All Collections'}
                </h1>
                <p className="text-xs sm:text-sm text-white/80 max-w-md">
                  Browse authentic branded products with official warranty and free delivery over ৳1,000.
                </p>
              </div>

              {currentCategoryObj?.image && (
                <div className="w-36 h-36 sm:w-48 sm:h-48 rounded-2xl overflow-hidden shadow-2xl shrink-0 border-2 border-white/20">
                  <img
                    src={currentCategoryObj.image}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* Subcategory Filter Chips & Sort Row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
              {/* Chips */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedSubcategory('All')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                    selectedSubcategory === 'All'
                      ? 'bg-[#D32F2F] text-white shadow-xs'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
                  }`}
                >
                  All Products
                </button>
                {currentCategoryObj?.subcategories?.map(sub => (
                  <button
                    key={sub}
                    onClick={() => setSelectedSubcategory(sub)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                      selectedSubcategory === sub
                        ? 'bg-[#D32F2F] text-white shadow-xs'
                        : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>

              {/* Price Sort Dropdown */}
              <div className="flex items-center gap-2 text-xs">
                <Filter className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-gray-500 font-medium">Sort by:</span>
                <select
                  value={priceSort}
                  onChange={e => setPriceSort(e.target.value as any)}
                  className="bg-white border border-gray-200 rounded-lg p-1.5 font-semibold text-gray-700 focus:outline-none focus:border-[#D32F2F]"
                >
                  <option value="default">Featured</option>
                  <option value="low_to_high">Price: Low to High</option>
                  <option value="high_to_low">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <ProductGridSkeleton count={8} />
            ) : displayedProducts.length === 0 ? (
              <div className="p-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-100">
                <p className="font-bold text-sm">No products found in this category.</p>
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setActiveNavTab('home');
                  }}
                  className="mt-3 text-xs text-[#D32F2F] font-bold hover:underline"
                >
                  Back to All Products
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                {displayedProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW: DEALS / TRENDING / BEST SELLERS / SEARCH / WISHLIST */}
        {['deals', 'trending', 'best_sellers', 'new', 'search', 'wishlist'].includes(activeNavTab) && (
          <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 capitalize">
                  {activeNavTab === 'deals' && t.dealsAndOffers}
                  {activeNavTab === 'trending' && t.trending}
                  {activeNavTab === 'best_sellers' && t.bestSellers}
                  {activeNavTab === 'new' && t.newArrivals}
                  {activeNavTab === 'wishlist' && `${t.wishlist} (${wishlist.length})`}
                  {activeNavTab === 'search' && `Search Results for "${searchQuery}"`}
                </h1>
                <p className="text-xs text-gray-500">
                  {displayedProducts.length} items found
                </p>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-500 font-medium">Sort:</span>
                <select
                  value={priceSort}
                  onChange={e => setPriceSort(e.target.value as any)}
                  className="bg-white border border-gray-200 rounded-lg p-1.5 text-xs font-semibold text-gray-700"
                >
                  <option value="default">Default</option>
                  <option value="low_to_high">Price: Low to High</option>
                  <option value="high_to_low">Price: High to Low</option>
                </select>
              </div>
            </div>

            {isLoading ? (
              <ProductGridSkeleton count={8} />
            ) : displayedProducts.length === 0 ? (
              <div className="p-16 text-center text-gray-500 bg-white rounded-2xl border border-gray-100">
                <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="font-bold text-sm text-gray-800">No items to display here.</p>
                <p className="text-xs text-gray-400 mt-1">Browse our homepage collections to discover deals.</p>
                <button
                  onClick={() => setActiveNavTab('home')}
                  className="mt-4 bg-[#D32F2F] text-white text-xs font-bold px-6 py-2.5 rounded-full cursor-pointer"
                >
                  Explore Storefront
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                {displayedProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW: CONTACT US */}
        {activeNavTab === 'contact' && (
          <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8">
            <div className="text-center space-y-2">
              <span className="bg-red-50 text-[#D32F2F] text-xs font-bold px-3 py-1 rounded-full uppercase">
                Customer Care
              </span>
              <h1 className="text-2xl sm:text-4xl font-black text-gray-900">
                Get in Touch with A1NOXHUB
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
                Have questions about your order, warranty, or delivery in Bangladesh? We’re here to help!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">
                  Headquarters & Support
                </h3>
                <div className="text-xs text-gray-600 space-y-3">
                  <p><strong>Office:</strong> A1NOXHUB Tower, Road 11, Block D, Gulshan-2, Dhaka 1212, Bangladesh</p>
                  <p><strong>Hotline:</strong> +880 1800-A1NOX (21669) (9 AM - 10 PM)</p>
                  <p><strong>Support Email:</strong> support@a1noxhub.com</p>
                  <p><strong>Domain:</strong> a1noxhub.com</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">
                  Send Us a Direct Message
                </h3>
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    alert('Thank you for contacting A1NOXHUB. We will reply within 24 hours.');
                  }}
                  className="space-y-3 text-xs"
                >
                  <input
                    type="text"
                    required
                    placeholder="Your Name"
                    className="w-full p-2.5 border rounded-xl"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Phone Number (01XXXXXXXXX)"
                    className="w-full p-2.5 border rounded-xl"
                  />
                  <textarea
                    required
                    rows={3}
                    placeholder="How can we assist you today?"
                    className="w-full p-2.5 border rounded-xl"
                  />
                  <button
                    type="submit"
                    className="w-full bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Message</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 3. Footer */}
      <Footer />

      {/* 4. Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* 5. Floating Widgets, Drawers & Modals */}
      <ToastContainer />
      <ProductDetailModal />
      <CartDrawer />
      <CheckoutModal />
      <QuickBuyModal />
      <OrderTrackingModal />
      <AdminDashboard />
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <StoreProvider>
        <StoreContent />
      </StoreProvider>
    </ToastProvider>
  );
}
