import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import {
  Search,
  ShoppingCart,
  Heart,
  User as UserIcon,
  Truck,
  ChevronDown,
  Menu,
  X,
  ShieldCheck,
  Package,
  Sparkles,
  LogOut,
  SlidersHorizontal,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    t,
    language,
    setLanguage,
    cart,
    wishlist,
    searchQuery,
    setSearchQuery,
    setIsCartOpen,
    setIsTrackingOpen,
    setIsAdminOpen,
    activeNavTab,
    setActiveNavTab,
    categories,
    setSelectedCategory,
    currentUser,
    isAdmin,
    handleGoogleLogin,
    handleLogout,
  } = useStore();

  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (tabId: string) => {
    setActiveNavTab(tabId);
    setSelectedCategory(null);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategorySelect = (catId: string) => {
    setSelectedCategory(catId);
    setActiveNavTab('category');
    setIsCategoryDropdownOpen(false);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-100">
      {/* 1. Top Announcement Bar (Red) */}
      <div className="bg-[#D32F2F] text-white text-xs sm:text-sm font-medium py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-white animate-pulse" />
            <span className="font-semibold">{t.announcement}</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            {/* Language Switcher */}
            <div className="flex items-center bg-black/15 rounded px-2 py-0.5 gap-1">
              <button
                onClick={() => setLanguage('bn')}
                className={`transition-colors font-medium cursor-pointer ${
                  language === 'bn' ? 'text-white font-bold underline' : 'text-white/80 hover:text-white'
                }`}
              >
                বাংলা
              </button>
              <span className="text-white/50">|</span>
              <button
                onClick={() => setLanguage('en')}
                className={`transition-colors font-medium cursor-pointer ${
                  language === 'en' ? 'text-white font-bold underline' : 'text-white/80 hover:text-white'
                }`}
              >
                English
              </button>
            </div>

            {/* Quick Track Order Link */}
            <button
              onClick={() => setIsTrackingOpen(true)}
              className="hidden sm:flex items-center gap-1 text-white/90 hover:text-white transition-colors cursor-pointer"
            >
              <Package className="w-3.5 h-3.5" />
              <span>{t.trackOrder}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Header Row (White) */}
      <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between gap-4 sm:gap-8">
        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-1.5 text-gray-700 hover:text-[#D32F2F] rounded-lg hover:bg-gray-100 cursor-pointer"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Brand Logo */}
        <div
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D32F2F] to-[#B71C1C] flex items-center justify-center text-white font-black text-xl shadow-md shadow-red-200 group-hover:scale-105 transition-transform">
            A1
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-gray-900">
                A1<span className="text-[#D32F2F]">NOXHUB</span>
              </span>
            </div>
            <p className="text-[10px] text-gray-500 font-medium tracking-wide hidden sm:block">
              Premium Products, Better Living.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl relative hidden md:block">
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full bg-gray-50 text-gray-800 placeholder-gray-400 text-sm rounded-full pl-5 pr-12 py-2.5 border border-gray-200 focus:outline-none focus:border-[#D32F2F] focus:bg-white focus:ring-2 focus:ring-red-100 transition-all"
            />
            <button
              onClick={() => {
                if (searchQuery.trim()) {
                  setActiveNavTab('search');
                }
              }}
              className="absolute right-1.5 top-1.5 bottom-1.5 w-9 h-9 rounded-full bg-[#D32F2F] hover:bg-[#B71C1C] text-white flex items-center justify-center shadow transition-colors cursor-pointer"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Actions: Account, Wishlist, Cart */}
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Account Dropdown */}
          <div className="relative" ref={accountRef}>
            <button
              onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
              className="flex items-center gap-2 p-1.5 rounded-lg text-gray-700 hover:text-[#D32F2F] hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                {currentUser?.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-5 h-5" />
                )}
              </div>
              <div className="hidden xl:block text-left text-xs">
                <span className="text-gray-400 block font-normal">
                  {currentUser ? 'Hello,' : 'Sign in'}
                </span>
                <span className="font-semibold text-gray-800 block truncate max-w-[100px]">
                  {currentUser?.displayName ? currentUser.displayName.split(' ')[0] : t.account}
                </span>
              </div>
            </button>

            {/* Account Menu Popover */}
            {isAccountMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 text-sm">
                {currentUser ? (
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="font-bold text-gray-900 truncate">{currentUser.displayName || 'Customer'}</p>
                    <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                    {isAdmin && (
                      <span className="inline-block mt-1 bg-red-100 text-[#D32F2F] text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Admin Authorized
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="px-4 py-3 border-b border-gray-100 text-center">
                    <p className="text-xs text-gray-600 mb-2">Sign in to manage orders & wishlist</p>
                    <button
                      onClick={() => {
                        handleGoogleLogin();
                        setIsAccountMenuOpen(false);
                      }}
                      className="w-full bg-[#D32F2F] hover:bg-[#B71C1C] text-white py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <UserIcon className="w-3.5 h-3.5" />
                      {t.loginWithGoogle}
                    </button>
                  </div>
                )}

                {/* 1. Customer Account Area */}
                <div className="py-1">
                  <span className="px-4 py-1 text-[10px] uppercase font-bold text-gray-400 tracking-wider block">
                    Customer Account
                  </span>
                  <button
                    onClick={() => {
                      setIsTrackingOpen(true);
                      setIsAccountMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Package className="w-4 h-4 text-gray-400" />
                    <span>{t.trackOrder}</span>
                  </button>
                  <button
                    onClick={() => {
                      handleNavClick('wishlist');
                      setIsAccountMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Heart className="w-4 h-4 text-gray-400" />
                    <span>{t.wishlist}</span>
                  </button>
                </div>

                {/* 2. Store Administration Area (Only ONE clean Admin entry) */}
                <div className="border-t border-gray-100 py-1">
                  <span className="px-4 py-1 text-[10px] uppercase font-bold text-gray-400 tracking-wider block">
                    Store Administration
                  </span>
                  <button
                    onClick={() => {
                      setIsAdminOpen(true);
                      setIsAccountMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-gray-800 hover:bg-red-50 hover:text-[#D32F2F] flex items-center justify-between cursor-pointer font-medium transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#D32F2F]" />
                      <span>{t.adminPanel}</span>
                    </div>
                    {isAdmin ? (
                      <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                        Authorized
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-500 text-[10px] font-medium px-1.5 py-0.5 rounded">
                        Owner Login
                      </span>
                    )}
                  </button>
                </div>

                {currentUser && (
                  <div className="border-t border-gray-100 pt-1">
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsAccountMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-gray-600 hover:bg-red-50 hover:text-red-600 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t.logout}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={() => handleNavClick('wishlist')}
            className="relative flex items-center gap-1.5 text-gray-700 hover:text-[#D32F2F] transition-colors p-1.5 rounded-lg cursor-pointer"
            aria-label="Wishlist"
          >
            <div className="relative">
              <Heart className="w-6 h-6 text-gray-700 hover:text-[#D32F2F] transition-colors" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#D32F2F] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </div>
            <span className="hidden xl:inline text-xs font-semibold text-gray-700">
              {t.wishlist}
            </span>
          </button>

          {/* Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 bg-red-50 hover:bg-red-100 text-[#D32F2F] px-3 py-2 rounded-xl transition-all cursor-pointer font-semibold text-sm"
            aria-label="Open Cart"
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5 text-[#D32F2F]" />
              {totalCartCount > 0 && (
                <span className="absolute -top-2 -right-2.5 bg-[#D32F2F] text-white text-[11px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow">
                  {totalCartCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline font-bold">{t.cart}</span>
          </button>
        </div>
      </div>

      {/* Mobile Search Bar Row */}
      <div className="px-4 pb-3 md:hidden">
        <div className="relative flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full bg-gray-50 text-gray-800 placeholder-gray-400 text-xs rounded-full pl-4 pr-10 py-2 border border-gray-200 focus:outline-none focus:border-[#D32F2F]"
          />
          <button
            onClick={() => {
              if (searchQuery.trim()) {
                setActiveNavTab('search');
              }
            }}
            className="absolute right-1 w-7 h-7 rounded-full bg-[#D32F2F] text-white flex items-center justify-center"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Navigation Bar (All Categories + Nav Links) */}
      <div className="border-t border-gray-100 hidden lg:block bg-white">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          {/* All Categories Dropdown Button */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              className="bg-[#D32F2F] hover:bg-[#B71C1C] text-white px-6 py-3 font-bold text-sm flex items-center gap-3 rounded-t-lg transition-colors cursor-pointer select-none"
            >
              <Menu className="w-4 h-4" />
              <span>{t.allCategories}</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  isCategoryDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isCategoryDropdownOpen && (
              <div className="absolute top-full left-0 w-64 bg-white rounded-b-xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.id)}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-red-50 hover:text-[#D32F2F] flex items-center justify-between transition-colors cursor-pointer font-medium"
                  >
                    <span>{language === 'bn' ? cat.nameBn : cat.name}</span>
                    <span className="text-gray-400 text-xs">›</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Nav Links */}
          <nav className="flex items-center gap-1 xl:gap-2">
            {[
              { id: 'home', label: t.home },
              { id: 'deals', label: t.dealsAndOffers, badge: 'HOT' },
              { id: 'trending', label: t.trending },
              { id: 'new', label: t.newArrivals },
              { id: 'best_sellers', label: t.bestSellers },
              { id: 'contact', label: t.contact },
            ].map(link => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`px-3.5 py-3 text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer relative ${
                  activeNavTab === link.id
                    ? 'text-[#D32F2F] border-b-2 border-[#D32F2F]'
                    : 'text-gray-600 hover:text-[#D32F2F]'
                }`}
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span className="bg-[#D32F2F] text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                    {link.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex">
          <div className="w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="p-4 bg-[#D32F2F] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white text-[#D32F2F] font-black flex items-center justify-center text-sm">
                  A1
                </div>
                <span className="font-bold text-lg">A1NOXHUB</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded-full text-white/80 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Navigation
                </h4>
                <div className="space-y-1">
                  {[
                    { id: 'home', label: t.home },
                    { id: 'deals', label: t.dealsAndOffers },
                    { id: 'trending', label: t.trending },
                    { id: 'new', label: t.newArrivals },
                    { id: 'best_sellers', label: t.bestSellers },
                    { id: 'contact', label: t.contact },
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold transition cursor-pointer ${
                        activeNavTab === item.id
                          ? 'bg-red-50 text-[#D32F2F]'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  {t.allCategories}
                </h4>
                <div className="space-y-1">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategorySelect(cat.id)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-red-50 hover:text-[#D32F2F] rounded-lg flex items-center justify-between transition cursor-pointer"
                    >
                      <span>{language === 'bn' ? cat.nameBn : cat.name}</span>
                      <span className="text-xs text-gray-400">›</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
              <button
                onClick={() => {
                  setIsTrackingOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="text-xs font-semibold text-gray-700 flex items-center gap-1.5"
              >
                <Package className="w-4 h-4 text-[#D32F2F]" />
                <span>{t.trackOrder}</span>
              </button>
              <button
                onClick={() => {
                  setIsAdminOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="text-xs font-semibold text-[#D32F2F] flex items-center gap-1.5"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>{t.adminPanel}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
