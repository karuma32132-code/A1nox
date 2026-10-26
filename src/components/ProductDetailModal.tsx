import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { formatBDT } from '../utils/translations';
import {
  X,
  Star,
  ShieldCheck,
  RotateCcw,
  HandCoins,
  Check,
  Plus,
  Minus,
  ShoppingCart,
  Zap,
  Play,
  Share2,
  Copy,
  Film,
  ExternalLink,
  AlertCircle,
  Youtube,
} from 'lucide-react';
import {
  getYouTubeEmbedUrl,
  isValidYouTubeUrl,
  getFacebookEmbedUrl,
  isValidFacebookVideoUrl,
} from '../utils/mediaUtils';

export const ProductDetailModal: React.FC = () => {
  const {
    selectedProduct,
    setSelectedProduct,
    addToCart,
    openQuickBuy,
    setIsCheckoutOpen,
    language,
    t,
  } = useStore();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    selectedProduct?.colors?.[0]
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews' | 'video'>('desc');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [activeVideoSource, setActiveVideoSource] = useState<'uploaded' | 'youtube' | 'facebook'>('uploaded');

  // New review form state
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittedReview, setSubmittedReview] = useState(false);

  // Sync active video source when product opens
  React.useEffect(() => {
    if (selectedProduct) {
      if (selectedProduct.videoUrl) {
        setActiveVideoSource('uploaded');
      } else if (selectedProduct.youtubeUrl) {
        setActiveVideoSource('youtube');
      } else if (selectedProduct.facebookVideoUrl) {
        setActiveVideoSource('facebook');
      }
      setActiveImageIndex(0);
    }
  }, [selectedProduct?.id, selectedProduct?.videoUrl, selectedProduct?.youtubeUrl, selectedProduct?.facebookVideoUrl]);

  if (!selectedProduct) return null;

  const discountPercent =
    selectedProduct.salePrice && selectedProduct.salePrice > selectedProduct.price
      ? Math.round(
          ((selectedProduct.salePrice - selectedProduct.price) / selectedProduct.salePrice) * 100
        )
      : null;

  const handleAddToCart = () => {
    addToCart(selectedProduct, quantity, selectedColor);
  };

  const handleBuyNow = () => {
    openQuickBuy(selectedProduct, quantity, selectedColor);
    setSelectedProduct(null);
  };

  const handleShare = () => {
    const url = `${window.location.origin}/?product=${selectedProduct.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const hasAnyVideo = Boolean(
    selectedProduct.videoUrl || selectedProduct.youtubeUrl || selectedProduct.facebookVideoUrl
  );

  const renderVideoPlayer = (isModal = false) => {
    if (!hasAnyVideo) {
      return (
        <div className="aspect-video w-full rounded-2xl bg-gray-900 overflow-hidden flex flex-col items-center justify-center p-6 text-center text-white">
          <Film className="w-12 h-12 text-slate-500 mb-2" />
          <h4 className="font-bold text-sm text-slate-300">No Video Review Available</h4>
          <p className="text-xs text-slate-500 max-w-sm mt-1">
            There is currently no demonstration video attached to this product.
          </p>
        </div>
      );
    }

    const availableSources = [
      selectedProduct.videoUrl
        ? {
            id: 'uploaded',
            label: 'Uploaded Video',
            icon: <Film className="w-3.5 h-3.5" />,
          }
        : null,
      selectedProduct.youtubeUrl
        ? {
            id: 'youtube',
            label: 'YouTube Video',
            icon: <Youtube className="w-3.5 h-3.5 text-red-500" />,
          }
        : null,
      selectedProduct.facebookVideoUrl
        ? {
            id: 'facebook',
            label: 'Facebook Video',
            icon: <span className="font-bold text-blue-500 text-xs">f</span>,
          }
        : null,
    ].filter(Boolean) as {
      id: 'uploaded' | 'youtube' | 'facebook';
      label: string;
      icon: React.ReactNode;
    }[];

    const currentSource = availableSources.some(s => s.id === activeVideoSource)
      ? activeVideoSource
      : availableSources[0]?.id || 'uploaded';

    return (
      <div className="space-y-3 w-full">
        {/* Source Switcher if multiple videos exist */}
        {availableSources.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-[11px] font-bold text-gray-500 shrink-0">Switch Source:</span>
            {availableSources.map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveVideoSource(s.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                  currentSource === s.id
                    ? 'bg-[#D32F2F] text-white shadow-md'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {s.icon}
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* 1. Uploaded Manual Video */}
        {currentSource === 'uploaded' && selectedProduct.videoUrl && (
          <div className="aspect-video w-full rounded-2xl bg-black overflow-hidden shadow-xl border border-gray-200">
            <video
              controls
              playsInline
              autoPlay={isModal}
              src={selectedProduct.videoUrl}
              className="w-full h-full object-contain bg-black"
            >
              Your browser does not support HTML5 video playback.
            </video>
          </div>
        )}

        {/* 2. YouTube Video */}
        {currentSource === 'youtube' && selectedProduct.youtubeUrl && (
          <div className="space-y-2">
            {isValidYouTubeUrl(selectedProduct.youtubeUrl) ? (
              <div className="aspect-video w-full rounded-2xl bg-black overflow-hidden shadow-xl border border-gray-200">
                <iframe
                  src={getYouTubeEmbedUrl(selectedProduct.youtubeUrl)!}
                  title={`${selectedProduct.title} - YouTube Video`}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs text-center space-y-2">
                <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
                <p className="font-bold">This YouTube video cannot be embedded inline.</p>
                <a
                  href={selectedProduct.youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[#D32F2F] font-bold underline"
                >
                  <span>Open Video directly on YouTube</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        )}

        {/* 3. Facebook Video */}
        {currentSource === 'facebook' && selectedProduct.facebookVideoUrl && (
          <div className="space-y-3">
            {isValidFacebookVideoUrl(selectedProduct.facebookVideoUrl) ? (
              <div className="aspect-video w-full rounded-2xl bg-black overflow-hidden shadow-xl border border-gray-200">
                <iframe
                  src={getFacebookEmbedUrl(selectedProduct.facebookVideoUrl)!}
                  title={`${selectedProduct.title} - Facebook Video`}
                  className="w-full h-full border-0"
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            ) : null}

            {/* Fallback & direct button for Facebook */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
              <span className="text-[11px] text-blue-800">
                ℹ️ If Facebook restricts in-frame playback, click to watch directly:
              </span>
              <a
                href={selectedProduct.facebookVideoUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-[#1877F2] hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition shrink-0"
              >
                <span>Watch on Facebook</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden border border-gray-100 my-auto relative">
        {/* Close Button */}
        <button
          onClick={() => setSelectedProduct(null)}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 max-h-[85vh] overflow-y-auto">
          {/* Left Column: Image Gallery & Video Trigger */}
          <div className="md:col-span-6 p-4 sm:p-6 bg-gray-50 flex flex-col items-center justify-between border-b md:border-b-0 md:border-r border-gray-100">
            {/* Main Image Display */}
            <div className="relative w-full aspect-square max-h-80 sm:max-h-96 flex items-center justify-center">
              <img
                src={selectedProduct.images[activeImageIndex] || selectedProduct.images[0]}
                alt={selectedProduct.title}
                className="max-h-full max-w-full object-contain drop-shadow-md rounded-xl"
              />

              {/* Video Badge Button */}
              {hasAnyVideo && (
                <button
                  onClick={() => setIsVideoModalOpen(true)}
                  className="absolute bottom-3 left-3 bg-black/80 hover:bg-[#D32F2F] text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg backdrop-blur-xs transition-all hover:scale-105 cursor-pointer z-10"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Watch Video</span>
                </button>
              )}
            </div>

            {/* Thumbnail Row */}
            <div className="flex gap-2 sm:gap-3 mt-4 overflow-x-auto w-full justify-center py-1">
              {selectedProduct.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 p-1 bg-white overflow-hidden transition-all cursor-pointer shrink-0 ${
                    activeImageIndex === idx
                      ? 'border-[#D32F2F] shadow-md ring-2 ring-red-500/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-contain rounded-lg" />
                </button>
              ))}

              {/* Video Thumbnail Button */}
              {hasAnyVideo && (
                <button
                  onClick={() => setIsVideoModalOpen(true)}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 border-dashed border-[#D32F2F] bg-red-50 hover:bg-red-100 flex flex-col items-center justify-center text-[#D32F2F] transition-all cursor-pointer shrink-0 shadow-xs"
                  title="Watch Product Video"
                >
                  <Play className="w-5 h-5 fill-[#D32F2F]" />
                  <span className="text-[9px] font-black uppercase mt-0.5">Video</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Product Info & Actions */}
          <div className="md:col-span-6 p-4 sm:p-6 flex flex-col justify-between">
            <div>
              {/* Category & Share Row */}
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span className="font-semibold text-[#D32F2F] uppercase tracking-wider">
                  {selectedProduct.categoryName}
                </span>

                <button
                  onClick={handleShare}
                  className="flex items-center gap-1 text-gray-500 hover:text-[#D32F2F] font-medium transition cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Link Copied!' : 'Share Product'}</span>
                </button>
              </div>

              {/* Title */}
              <h2 className="text-lg sm:text-xl font-black text-gray-900 leading-snug">
                {language === 'bn' ? selectedProduct.titleBn : selectedProduct.title}
              </h2>

              {/* Rating & Reviews */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(selectedProduct.rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-gray-800">
                  {selectedProduct.rating} ({selectedProduct.reviewCount.toLocaleString()} {t.reviews})
                </span>
              </div>

              {/* Pricing in BDT */}
              <div className="flex items-baseline gap-3 mt-3">
                <span className="text-2xl sm:text-3xl font-black text-[#D32F2F]">
                  {formatBDT(selectedProduct.price)}
                </span>
                {selectedProduct.salePrice && selectedProduct.salePrice > selectedProduct.price && (
                  <span className="text-sm text-gray-400 line-through font-semibold">
                    {formatBDT(selectedProduct.salePrice)}
                  </span>
                )}
                {discountPercent && (
                  <span className="bg-[#D32F2F] text-white text-xs font-extrabold px-2 py-0.5 rounded-md">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>

              {/* Feature Highlights */}
              {selectedProduct.features && selectedProduct.features.length > 0 && (
                <div className="mt-4 space-y-1.5 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  {selectedProduct.features.slice(0, 4).map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-gray-700 font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#D32F2F]" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Color Selection */}
              {selectedProduct.colors && selectedProduct.colors.length > 0 && (
                <div className="mt-4">
                  <span className="text-xs font-bold text-gray-700 block mb-1.5">
                    {t.color}: <span className="font-semibold text-gray-900">{selectedColor}</span>
                  </span>
                  <div className="flex gap-2">
                    {selectedProduct.colors.map(col => (
                      <button
                        key={col}
                        onClick={() => setSelectedColor(col)}
                        className={`px-3 py-1 text-xs rounded-lg font-medium border transition cursor-pointer ${
                          selectedColor === col
                            ? 'border-[#D32F2F] bg-red-50 text-[#D32F2F] font-bold'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {col}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mt-4 flex items-center gap-3">
                <span className="text-xs font-bold text-gray-700">{t.quantity}:</span>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1.5 text-gray-600 hover:bg-gray-100 transition cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 text-xs font-bold text-gray-800">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-1.5 text-gray-600 hover:bg-gray-100 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Action Buttons: Add to Cart & Buy Now */}
              <div className="grid grid-cols-2 gap-3 mt-6">
                <button
                  onClick={handleAddToCart}
                  className="bg-red-50 hover:bg-red-100 text-[#D32F2F] font-bold py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 border border-red-200 transition-colors cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>{t.addToCart}</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  className="bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-500/25 transition-all cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>{t.buyNow}</span>
                </button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-gray-100 text-center">
                <div className="flex flex-col items-center">
                  <ShieldCheck className="w-4 h-4 text-green-600 mb-1" />
                  <span className="text-[10px] font-semibold text-gray-600">{t.originalProduct}</span>
                </div>
                <div className="flex flex-col items-center">
                  <RotateCcw className="w-4 h-4 text-blue-600 mb-1" />
                  <span className="text-[10px] font-semibold text-gray-600">{t.daysReturn}</span>
                </div>
                <div className="flex flex-col items-center">
                  <HandCoins className="w-4 h-4 text-amber-600 mb-1" />
                  <span className="text-[10px] font-semibold text-gray-600">{t.cashOnDelivery}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Tabs: Description, Specs, Reviews, Video */}
        <div className="border-t border-gray-100 p-4 sm:p-6 bg-white">
          <div className="flex border-b border-gray-100 gap-4 sm:gap-8 mb-4">
            {[
              { id: 'desc', label: t.description },
              { id: 'specs', label: t.specifications },
              { id: 'reviews', label: `${t.reviews} (${selectedProduct.reviewCount})` },
              { id: 'video', label: t.video },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-2.5 text-xs sm:text-sm font-bold transition cursor-pointer relative ${
                  activeTab === tab.id
                    ? 'text-[#D32F2F] border-b-2 border-[#D32F2F]'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 1: Description */}
          {activeTab === 'desc' && (
            <div className="text-xs sm:text-sm text-gray-600 leading-relaxed space-y-2">
              <p>
                {language === 'bn' && selectedProduct.descriptionBn
                  ? selectedProduct.descriptionBn
                  : selectedProduct.description}
              </p>
            </div>
          )}

          {/* Tab 2: Specifications */}
          {activeTab === 'specs' && (
            <div className="overflow-hidden rounded-xl border border-gray-100">
              <table className="w-full text-xs text-left">
                <tbody>
                  {Object.entries(selectedProduct.specifications).map(([key, val], idx) => (
                    <tr
                      key={key}
                      className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                    >
                      <td className="px-4 py-2.5 font-bold text-gray-700 w-1/3">{key}</td>
                      <td className="px-4 py-2.5 text-gray-600">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 3: Reviews */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-gray-800">Customer Ratings & Reviews</h4>
                  <p className="text-xs text-gray-500">Genuine verified buyer feedback</p>
                </div>
              </div>

              {/* Sample Reviews */}
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-gray-800">Tanvir Ahmed (Dhanmondi, Dhaka)</span>
                    <span className="text-gray-400 text-[10px]">2 days ago</span>
                  </div>
                  <div className="flex text-amber-400 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-gray-600">
                    "Alhamdulillah, product quality is 100% authentic as promised. Fast 24h delivery inside Dhaka. Very pleased with A1NOXHUB!"
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-gray-800">Sadia Islam (Chittagong)</span>
                    <span className="text-gray-400 text-[10px]">5 days ago</span>
                  </div>
                  <div className="flex text-amber-400 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-gray-600">
                    "Battery life is fantastic, exactly 7 days on normal usage. Customer support was very helpful on phone."
                  </p>
                </div>
              </div>

              {/* Add review form */}
              <div className="p-3 rounded-xl border border-gray-200 mt-4">
                <h5 className="text-xs font-bold text-gray-800 mb-2">Write a Review</h5>
                {submittedReview ? (
                  <p className="text-xs text-green-600 font-bold">Thank you! Your review has been submitted.</p>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={reviewName}
                      onChange={e => setReviewName(e.target.value)}
                      className="w-full text-xs p-2 border rounded-lg"
                    />
                    <textarea
                      placeholder="Share your experience with this product..."
                      value={reviewComment}
                      onChange={e => setReviewComment(e.target.value)}
                      rows={2}
                      className="w-full text-xs p-2 border rounded-lg"
                    />
                    <button
                      onClick={() => {
                        if (reviewName && reviewComment) {
                          setSubmittedReview(true);
                        }
                      }}
                      className="bg-[#D32F2F] text-white text-xs font-bold px-3 py-1.5 rounded-lg"
                    >
                      Submit Review
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 4: Video */}
          {activeTab === 'video' && (
            <div className="w-full">
              {hasAnyVideo ? (
                renderVideoPlayer(false)
              ) : (
                <div className="aspect-video w-full rounded-2xl bg-gray-50 border border-gray-200 flex flex-col items-center justify-center p-6 text-center space-y-2">
                  <Play className="w-10 h-10 text-gray-300 mx-auto" />
                  <h4 className="font-bold text-sm text-gray-700">No Video Available</h4>
                  <p className="text-xs text-gray-500 max-w-sm">
                    No video showcase or unboxing has been uploaded for this product yet.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Video Modal Player */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
          <div className="max-w-3xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl relative border border-gray-800">
            {/* Header */}
            <div className="bg-gray-900 px-5 py-3.5 flex items-center justify-between border-b border-gray-800">
              <div className="flex items-center gap-2 text-white">
                <Play className="w-4 h-4 text-[#D32F2F] fill-[#D32F2F]" />
                <h3 className="font-bold text-sm truncate max-w-md">
                  {selectedProduct.title} — Video Showcase
                </h3>
              </div>
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="text-gray-400 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors cursor-pointer"
                aria-label="Close video player"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Video Body */}
            <div className="p-4 bg-gray-950">
              {renderVideoPlayer(true)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
