import React from 'react';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden flex flex-col justify-between animate-pulse">
      {/* Top badges & heart button placeholder */}
      <div className="relative w-full pt-[100%] bg-slate-100">
        <div className="absolute top-2.5 left-2.5 w-14 h-4 bg-slate-200 rounded-md" />
        <div className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-slate-200" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-xl bg-slate-200/60" />
        </div>
      </div>

      {/* Info placeholder */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          {/* Category */}
          <div className="w-16 h-2.5 bg-slate-200 rounded" />
          {/* Title 2 lines */}
          <div className="w-full h-3.5 bg-slate-200 rounded" />
          <div className="w-3/4 h-3.5 bg-slate-200 rounded" />
          {/* Rating */}
          <div className="flex items-center gap-1.5 pt-1">
            <div className="w-20 h-3 bg-slate-200 rounded" />
          </div>
        </div>

        {/* Pricing and Button */}
        <div className="pt-3 border-t border-slate-100 space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="w-20 h-4 bg-slate-200 rounded" />
            <div className="w-12 h-3 bg-slate-200 rounded" />
          </div>
          <div className="w-full h-8 bg-slate-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
      {[...Array(count)].map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
};

export const CategorySliderSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-none py-2 px-1">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="shrink-0 w-32 sm:w-40 flex flex-col items-center p-3 sm:p-4 rounded-2xl bg-white border border-gray-100 shadow-xs animate-pulse text-center"
        >
          <div className="w-20 h-20 sm:w-26 sm:h-26 rounded-2xl bg-slate-100 mb-3" />
          <div className="w-20 h-3 bg-slate-200 rounded mb-1" />
          <div className="w-12 h-2.5 bg-slate-100 rounded" />
        </div>
      ))}
    </div>
  );
};

export const CategoryBannerSkeleton: React.FC = () => {
  return (
    <div className="rounded-3xl bg-slate-200/80 p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs animate-pulse">
      <div className="space-y-3 w-full sm:w-1/2">
        <div className="w-24 h-4 bg-slate-300 rounded-full" />
        <div className="w-3/4 h-8 bg-slate-300 rounded-lg" />
        <div className="w-full h-4 bg-slate-300 rounded" />
      </div>
      <div className="w-36 h-36 sm:w-48 sm:h-48 rounded-2xl bg-slate-300 shrink-0" />
    </div>
  );
};
