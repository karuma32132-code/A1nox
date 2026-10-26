import React from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { formatBDT } from '../utils/translations';
import { Heart, Star, ShoppingCart, Eye, Zap, Play } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const {
    language,
    t,
    addToCart,
    openQuickBuy,
    toggleWishlist,
    isInWishlist,
    setSelectedProduct,
  } = useStore();

  const isFavorited = isInWishlist(product.id);
  const hasVideo = Boolean(product.videoUrl || product.youtubeUrl || product.facebookVideoUrl);

  const discountPercent =
    product.salePrice && product.salePrice > product.price
      ? Math.round(((product.salePrice - product.price) / product.salePrice) * 100)
      : null;

  const handleCardClick = () => {
    setSelectedProduct(product);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleQuickBuy = (e: React.MouseEvent) => {
    e.stopPropagation();
    openQuickBuy(product, 1);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-xl hover:border-red-100 transition-all duration-300 flex flex-col justify-between overflow-hidden group cursor-pointer relative"
    >
      {/* Top badges: Discount & Trending */}
      <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
        {discountPercent && (
          <span className="bg-[#D32F2F] text-white text-[10px] sm:text-[11px] font-extrabold px-2 py-0.5 rounded-md shadow-xs tracking-wider">
            {discountPercent}% OFF
          </span>
        )}
        {product.isTrending && (
          <span className="bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded shadow-xs uppercase">
            TRENDING
          </span>
        )}
      </div>

      <button
        onClick={handleWishlistClick}
        className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
          isFavorited
            ? 'bg-red-50 text-[#D32F2F] shadow-xs'
            : 'bg-white/80 hover:bg-white text-gray-400 hover:text-[#D32F2F] shadow-xs backdrop-blur-xs'
        }`}
        aria-label="Save to Wishlist"
      >
        <Heart className={`w-4 h-4 ${isFavorited ? 'fill-[#D32F2F]' : ''}`} />
      </button>

      {/* Product Image */}
      <div className="relative w-full pt-[100%] bg-gray-50 overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.title}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-contain p-4 group-hover:scale-108 transition-transform duration-500"
        />

        {/* Video indicator badge */}
        {hasVideo && (
          <div className="absolute bottom-2.5 left-2.5 z-10 bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
            <Play className="w-2.5 h-2.5 fill-white" />
            <span>Video</span>
          </div>
        )}

        {/* Quick View Overlay on Desktop */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="bg-white/95 text-gray-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <Eye className="w-3.5 h-3.5" />
            Quick View
          </span>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category */}
          <span className="text-[11px] text-gray-400 font-medium block mb-1 uppercase tracking-wider">
            {product.categoryName}
          </span>

          {/* Title */}
          <h3 className="text-xs sm:text-sm font-bold text-gray-800 group-hover:text-[#D32F2F] transition-colors line-clamp-2 leading-snug">
            {language === 'bn' ? product.titleBn : product.title}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            </div>
            <span className="text-xs font-bold text-gray-700">{product.rating}</span>
            <span className="text-[11px] text-gray-400 font-medium">
              ({product.reviewCount > 999 ? `${(product.reviewCount / 1000).toFixed(1)}k` : product.reviewCount})
            </span>
          </div>
        </div>

        {/* Pricing and Add to Cart */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-baseline gap-2 mb-2.5">
            <span className="text-sm sm:text-base font-black text-gray-900">
              {formatBDT(product.price)}
            </span>
            {product.salePrice && product.salePrice > product.price && (
              <span className="text-xs text-gray-400 line-through">
                {formatBDT(product.salePrice)}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={handleAddToCart}
              className="bg-red-50 hover:bg-red-100 text-[#D32F2F] py-2 px-1.5 sm:px-2 rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer border border-red-200"
              title={t.addToCart}
            >
              <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{t.addToCart}</span>
            </button>
            <button
              type="button"
              onClick={handleQuickBuy}
              className="bg-[#D32F2F] hover:bg-[#B71C1C] text-white py-2 px-1.5 sm:px-2 rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1 sm:gap-1.5 shadow-xs hover:shadow-md transition-all cursor-pointer"
              title={t.quickBuy || 'Quick Buy'}
            >
              <Zap className="w-3.5 h-3.5 shrink-0 fill-white text-white" />
              <span className="truncate">{t.quickBuy || 'Quick Buy'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
