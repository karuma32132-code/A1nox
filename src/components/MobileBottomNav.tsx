import React from 'react';
import { useStore } from '../context/StoreContext';
import { Home, LayoutGrid, Flame, User, ShoppingBag } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const {
    activeNavTab,
    setActiveNavTab,
    cart,
    setIsCartOpen,
    setSelectedCategory,
    handleGoogleLogin,
    currentUser,
    isAdmin,
    setIsAdminOpen,
    setIsTrackingOpen,
  } = useStore();

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleTabClick = (tabId: string) => {
    if (tabId === 'cart') {
      setIsCartOpen(true);
      return;
    }
    if (tabId === 'categories') {
      setSelectedCategory(null);
      setActiveNavTab('all_categories');
      return;
    }
    if (tabId === 'account') {
      if (isAdmin) {
        setIsAdminOpen(true);
      } else {
        setIsTrackingOpen(true);
      }
      return;
    }
    setActiveNavTab(tabId);
    setSelectedCategory(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-3 py-2 shadow-lg">
      <div className="grid grid-cols-5 items-center text-center">
        {/* Home */}
        <button
          onClick={() => handleTabClick('home')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
            activeNavTab === 'home' ? 'text-[#D32F2F]' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-bold">Home</span>
        </button>

        {/* Categories */}
        <button
          onClick={() => handleTabClick('categories')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
            activeNavTab === 'all_categories' || activeNavTab === 'category'
              ? 'text-[#D32F2F]'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <LayoutGrid className="w-5 h-5" />
          <span className="text-[10px] font-bold">Categories</span>
        </button>

        {/* Deals */}
        <button
          onClick={() => handleTabClick('deals')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
            activeNavTab === 'deals' ? 'text-[#D32F2F]' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Flame className="w-5 h-5 text-amber-500" />
          <span className="text-[10px] font-bold">Deals</span>
        </button>

        {/* Account */}
        <button
          onClick={() => handleTabClick('account')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
            activeNavTab === 'account' ? 'text-[#D32F2F]' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-bold">Account</span>
        </button>

        {/* Cart */}
        <button
          onClick={() => handleTabClick('cart')}
          className="flex flex-col items-center gap-1 relative cursor-pointer text-gray-500 hover:text-[#D32F2F]"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {totalCartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#D32F2F] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow">
                {totalCartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold">Cart</span>
        </button>
      </div>
    </div>
  );
};
