import React, { useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { CategorySliderSkeleton } from './skeletons/StorefrontSkeletons';

export const TrendingCategories: React.FC = () => {
  const { categories, language, t, setSelectedCategory, setActiveNavTab, isLoading } = useStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setActiveNavTab('category');
    window.scrollTo({ top: 500, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <h2 className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight">
            {t.trendingCategories}
          </h2>
          <p className="text-xs text-gray-500 font-medium hidden sm:block">
            {language === 'bn' ? 'জনপ্রিয় বিভাগসমূহ ঘুরে দেখুন' : 'Explore popular collections curated for you'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Slider Arrow Controls */}
          <button
            onClick={() => scroll('left')}
            className="w-8 h-8 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 flex items-center justify-center shadow-xs transition-colors cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-8 h-8 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 flex items-center justify-center shadow-xs transition-colors cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setSelectedCategory(null);
              setActiveNavTab('all_categories');
            }}
            className="text-xs sm:text-sm font-bold text-[#D32F2F] hover:text-[#B71C1C] flex items-center gap-1 ml-2 transition-colors cursor-pointer"
          >
            <span>{t.seeAll}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel with skeleton screen during loading */}
      {isLoading ? (
        <CategorySliderSkeleton count={8} />
      ) : (
        <div
          ref={scrollContainerRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-none snap-x snap-mandatory py-2 px-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
        {categories.map(cat => (
          <div
            key={cat.id}
            onClick={() => handleCategoryClick(cat.id)}
            className="snap-start shrink-0 w-32 sm:w-40 flex flex-col items-center p-3 sm:p-4 rounded-2xl bg-white border border-gray-100 shadow-xs hover:shadow-md hover:border-red-100 transition-all cursor-pointer group text-center"
          >
            <div className="w-20 h-20 sm:w-26 sm:h-26 rounded-2xl bg-gray-50 flex items-center justify-center overflow-hidden mb-3 group-hover:scale-105 transition-transform">
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover rounded-2xl"
                loading="lazy"
              />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-gray-800 group-hover:text-[#D32F2F] transition-colors line-clamp-1">
              {language === 'bn' ? cat.nameBn : cat.name}
            </h3>
            <span className="text-[10px] text-gray-400 font-medium mt-0.5">
              {cat.subcategories?.length ? `${cat.subcategories.length} items` : 'Explore'}
            </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
