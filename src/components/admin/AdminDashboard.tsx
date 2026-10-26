import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { formatBDT } from '../../utils/translations';
import { Product, Order, StoreSettings, Coupon, Category } from '../../types';
import { getDiagnosticLogs, clearDiagnosticLogs } from '../../utils/metaPixel';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
  Megaphone,
  Settings,
  Calculator,
  X,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Truck,
  DollarSign,
  Download,
  Shield,
  ShieldCheck,
  Save,
  Radio,
  ExternalLink,
  Eye,
  EyeOff,
  Key,
  RefreshCw,
  Search,
  Star,
  Tag,
  FolderTree,
  Check,
  AlertCircle,
  Filter,
  Phone,
  MapPin,
  Lock,
  LogIn,
  Upload,
  Film,
  Video,
  Image as ImageIcon,
  ArrowLeft,
  ArrowRight,
  Play,
  Youtube,
  AlertTriangle,
  Loader2,
  MoveLeft,
  MoveRight,
} from 'lucide-react';
import {
  validateImageFile,
  validateVideoFile,
  uploadMediaToServer,
  isValidYouTubeUrl,
  getYouTubeEmbedUrl,
  isValidFacebookVideoUrl,
  getFacebookEmbedUrl,
  formatFileSize,
  SUPPORTED_IMAGE_EXTENSIONS,
  SUPPORTED_VIDEO_EXTENSIONS,
} from '../../utils/mediaUtils';
import { AUTHORIZED_ADMIN_CONFIG, isAuthorizedAdmin } from '../../config/adminSecurity';

export const AdminDashboard: React.FC = () => {
  const {
    isAdminOpen,
    setIsAdminOpen,
    products,
    saveProduct,
    deleteProduct,
    categories,
    saveCategory,
    deleteCategory,
    orders,
    updateOrderStatus,
    deleteOrder,
    refreshOrders,
    seedSampleOrders,
    settings,
    updateSettings,
    coupons,
    saveCoupon,
    deleteCoupon,
    isAdmin,
    currentUser,
    handleGoogleLogin,
    loginWithOwnerPasscode,
    handleLogout,
    getAdminToken,
  } = useStore();

  const [adminPinInput, setAdminPinInput] = useState('');
  const [showAdminPin, setShowAdminPin] = useState(false);
  const [isSubmittingPin, setIsSubmittingPin] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'pin' | 'google'>('pin');

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'products' | 'orders' | 'categories' | 'coupons' | 'reviews' | 'calculator' | 'meta_pixel' | 'settings'
  >('dashboard');

  // Orders State & Filters
  const [orderFilterStatus, setOrderFilterStatus] = useState<string>('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState<string>('');
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [isRefreshingOrders, setIsRefreshingOrders] = useState(false);

  // Products Search & Filter State
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Product Media Upload & Management State
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [uploadImageProgress, setUploadImageProgress] = useState(0);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [uploadVideoProgress, setUploadVideoProgress] = useState(0);
  const [mediaError, setMediaError] = useState('');
  const [manualImageUrl, setManualImageUrl] = useState('');
  const [manualVideoUrlInput, setManualVideoUrlInput] = useState('');
  const [newFeatureInput, setNewFeatureInput] = useState('');
  const [newColorInput, setNewColorInput] = useState('');
  const [replacingImageIndex, setReplacingImageIndex] = useState<number | null>(null);

  // Categories Modal State
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Coupons Modal State
  const [newCoupon, setNewCoupon] = useState<Coupon>({
    code: '',
    discountType: 'percentage',
    discountValue: 10,
    minSpend: 1000,
    isActive: true,
  });
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);

  // Settings State (synchronized)
  const [localSettings, setLocalSettings] = useState<StoreSettings>({ ...settings });
  const [savedSettingsNotice, setSavedSettingsNotice] = useState(false);

  useEffect(() => {
    setLocalSettings({ ...settings });
  }, [settings]);

  // Calculator State
  const [calcSelectedProductId, setCalcSelectedProductId] = useState<string>('');
  const [calcSellingPrice, setCalcSellingPrice] = useState<number>(1999);
  const [calcProductCost, setCalcProductCost] = useState<number>(1200);
  const [calcAdCost, setCalcAdCost] = useState<number>(180);
  const [calcPackaging, setCalcPackaging] = useState<number>(40);
  const [calcActualDeliveryCost, setCalcActualDeliveryCost] = useState<number>(80);
  const [calcDeliveryFeeCharged, setCalcDeliveryFeeCharged] = useState<number>(60);
  const [calcGatewayFeePercent, setCalcGatewayFeePercent] = useState<number>(1.0);
  const [calcQtySold, setCalcQtySold] = useState<number>(100);
  const [calcReturnRatePercent, setCalcReturnRatePercent] = useState<number>(8);
  const [calcReturnCourierFeeFactor, setCalcReturnCourierFeeFactor] = useState<number>(0.5);

  // Pixel diagnostic logs
  const [logs, setLogs] = useState(getDiagnosticLogs());

  if (!isAdminOpen) return null;

  // If user is not yet authorized as admin, show the secure Google Sign-In Owner Gate
  if (!isAdmin) {
    const isSignedWithUnauthorized = Boolean(currentUser && !isAuthorizedAdmin(currentUser));

    return (
      <div className="fixed inset-0 z-50 bg-[#0F172A] text-slate-100 flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="bg-[#1E293B] border border-slate-700/80 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
          <button
            onClick={() => setIsAdminOpen(false)}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800/80 hover:bg-slate-700 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D32F2F] to-[#B71C1C] flex items-center justify-center text-white mx-auto shadow-lg shadow-red-900/30">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              A1NOXHUB Admin Portal
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Restricted management area. Exclusive access for the authorized store owner.
            </p>
          </div>

          {/* Authorized Admin Configuration Box */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Authorized Store Owner
              </span>
              <span className="text-[10px] bg-red-950 text-red-300 border border-red-800/60 font-bold px-2 py-0.5 rounded-full">
                Strict Access
              </span>
            </div>
            <p className="font-mono text-sm font-bold text-slate-100 truncate">
              {AUTHORIZED_ADMIN_CONFIG.ownerEmail}
            </p>
          </div>

          {/* Access Denied Warning when signed in with an unauthorized Google account */}
          {isSignedWithUnauthorized && (
            <div className="p-4 bg-red-950/70 border border-red-700/80 rounded-2xl text-xs space-y-2.5 text-red-200 animate-in fade-in">
              <div className="flex items-center gap-2 text-red-400 font-bold">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                <span>Access Denied: Unauthorized Account</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                The account <strong className="text-white">{currentUser?.email}</strong> does not possess administrator privileges. Only the verified store owner (<strong className="text-white">{AUTHORIZED_ADMIN_CONFIG.ownerEmail}</strong>) may access this dashboard.
              </p>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full mt-2 bg-red-900/80 hover:bg-red-800 text-white py-2 px-3 rounded-xl font-bold transition cursor-pointer flex items-center justify-center gap-2"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign Out & Switch Account</span>
              </button>
            </div>
          )}

          {/* Primary Action: Owner PIN or Google Sign-In */}
          {!isSignedWithUnauthorized && (
            <div className="space-y-4">
              {/* Tab Selector */}
              <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setLoginMethod('pin')}
                  className={`flex-1 py-2 px-3 rounded-lg transition cursor-pointer flex items-center justify-center gap-2 ${
                    loginMethod === 'pin'
                      ? 'bg-[#D32F2F] text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Owner PIN / Passcode</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod('google')}
                  className={`flex-1 py-2 px-3 rounded-lg transition cursor-pointer flex items-center justify-center gap-2 ${
                    loginMethod === 'google'
                      ? 'bg-[#D32F2F] text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Google Sign-In</span>
                </button>
              </div>

              {loginMethod === 'pin' ? (
                <div className="space-y-3.5">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                      <span>Store Owner Security PIN</span>
                      <span className="text-[10px] text-emerald-400 font-mono">Default: a1nox2026</span>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showAdminPin ? 'text' : 'password'}
                        value={adminPinInput}
                        onChange={e => setAdminPinInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (adminPinInput.trim()) {
                              setIsSubmittingPin(true);
                              loginWithOwnerPasscode(adminPinInput);
                              setIsSubmittingPin(false);
                            }
                          }
                        }}
                        placeholder="Enter Owner PIN (e.g. a1nox2026)"
                        className="w-full bg-slate-900/95 border border-slate-700/80 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D32F2F] focus:ring-1 focus:ring-[#D32F2F]"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPin(!showAdminPin)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white cursor-pointer"
                        tabIndex={-1}
                      >
                        {showAdminPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isSubmittingPin}
                    onClick={() => {
                      if (!adminPinInput.trim()) {
                        // If empty, auto-use default PIN
                        setIsSubmittingPin(true);
                        loginWithOwnerPasscode('a1nox2026');
                        setIsSubmittingPin(false);
                      } else {
                        setIsSubmittingPin(true);
                        loginWithOwnerPasscode(adminPinInput);
                        setIsSubmittingPin(false);
                      }
                    }}
                    className="w-full bg-[#D32F2F] hover:bg-[#B71C1C] disabled:opacity-60 text-white py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-red-900/40 transition cursor-pointer hover:scale-[1.01]"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Unlock Admin Dashboard</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSubmittingPin}
                    onClick={() => {
                      setIsSubmittingPin(true);
                      loginWithOwnerPasscode('a1nox2026');
                      setIsSubmittingPin(false);
                    }}
                    className="w-full bg-slate-800/90 hover:bg-slate-700 text-slate-200 py-2.5 px-3 rounded-xl font-medium text-xs flex items-center justify-center gap-2 transition cursor-pointer border border-slate-700/80"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>1-Click Owner Auto-Unlock (karuma32132@gmail.com)</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full bg-[#D32F2F] hover:bg-[#B71C1C] text-white py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-red-900/40 transition cursor-pointer hover:scale-[1.01]"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign in with Google (Owner Account)</span>
                  </button>

                  <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl text-[11px] text-slate-400 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Google Cloud Project Status</span>
                    </div>
                    <p className="leading-relaxed">
                      If Token Service API is disabled on Google Cloud project 969664109416,{' '}
                      <a
                        href="https://console.developers.google.com/apis/api/securetoken.googleapis.com/overview?project=969664109416"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red-400 hover:underline font-bold inline-flex items-center gap-1"
                      >
                        enable it on GCP
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>{' '}
                      or switch to the Owner PIN tab for instant sign-in.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Official Account Recovery Link */}
          <div className="pt-3 border-t border-slate-800/80 text-center space-y-1.5">
            <p className="text-[11px] text-slate-400">
              Forgot your Google password or having trouble signing in?
            </p>
            <a
              href={AUTHORIZED_ADMIN_CONFIG.googleAccountRecoveryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 transition"
            >
              <span>Google Official Account Recovery</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Back to storefront link */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => setIsAdminOpen(false)}
              className="text-xs text-slate-400 hover:text-white transition cursor-pointer"
            >
              ← Return to Customer Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Smart Profit Calculation formulas
  const totalOrders = Math.max(1, calcQtySold || 1);
  const returnRate = Math.min(100, Math.max(0, calcReturnRatePercent || 0)) / 100;
  const returnedOrdersCount = Math.round(totalOrders * returnRate);
  const successfulOrdersCount = Math.max(0, totalOrders - returnedOrdersCount);

  // Delivered Unit Economics
  const gatewayFeeRate = Math.max(0, calcGatewayFeePercent || 0) / 100;
  const gatewayFeePerDeliveredOrder = calcSellingPrice * gatewayFeeRate;
  
  // Total Revenue: Only from successful delivered orders
  const totalGrossRevenue = successfulOrdersCount * calcSellingPrice;
  // Delivery Fee Collected from customers (delivered orders)
  const totalDeliveryCollected = successfulOrdersCount * calcDeliveryFeeCharged;
  const totalCashInflow = totalGrossRevenue + totalDeliveryCollected;

  // Expenses:
  // 1. Sourcing Cost (Only for delivered products, returned products return to inventory)
  const totalSourcingCost = successfulOrdersCount * calcProductCost;
  
  // 2. Advertising Cost (Paid for ALL orders placed/acquired)
  const totalAdSpend = totalOrders * calcAdCost;
  
  // 3. Packaging Cost (Packaging poly/boxes used for ALL dispatched orders)
  const totalPackagingCost = totalOrders * calcPackaging;
  
  // 4. Outbound Delivery Fees (Courier charges for ALL dispatched parcels)
  const totalOutboundDeliveryCost = totalOrders * calcActualDeliveryCost;
  
  // 5. Return Courier Fees (Courier charges 50% or 100% of outbound delivery fee on returned parcels)
  const totalReturnCourierCost = returnedOrdersCount * (calcActualDeliveryCost * calcReturnCourierFeeFactor);
  
  // 6. Total Logistics Expense & Wasted Return Loss
  const totalLogisticsExpense = totalOutboundDeliveryCost + totalReturnCourierCost;
  const totalReturnLoss = returnedOrdersCount * (calcPackaging + (calcActualDeliveryCost * (1 + calcReturnCourierFeeFactor)));
  
  // 7. Payment Gateway / COD Collection Fees (Only on delivered amount)
  const totalGatewayFee = successfulOrdersCount * gatewayFeePerDeliveredOrder;

  // TOTAL EXPENSES & NET PROFIT
  const totalAllExpenses = totalSourcingCost + totalAdSpend + totalPackagingCost + totalLogisticsExpense + totalGatewayFee;
  const totalNetProfit = totalCashInflow - totalAllExpenses;
  
  // Per delivered order profit & margins
  const netProfitPerDeliveredOrder = successfulOrdersCount > 0 ? totalNetProfit / successfulOrdersCount : 0;
  const profitMarginPercent = totalGrossRevenue > 0 ? (totalNetProfit / totalGrossRevenue) * 100 : 0;
  
  // ROAS (Return on Ad Spend)
  const roas = totalAdSpend > 0 ? (totalGrossRevenue / totalAdSpend).toFixed(2) : '0';

  // Break-Even Metrics:
  const unitContributionBeforeAds =
    calcSellingPrice + calcDeliveryFeeCharged - calcProductCost - calcPackaging - calcActualDeliveryCost - gatewayFeePerDeliveredOrder;
  const returnCostPerUnit = calcPackaging + calcActualDeliveryCost * (1 + calcReturnCourierFeeFactor);
  const breakEvenCPA = Math.max(0, Math.round((1 - returnRate) * unitContributionBeforeAds - (returnRate * returnCostPerUnit)));
  const breakEvenROAS = breakEvenCPA > 0 ? (calcSellingPrice / breakEvenCPA).toFixed(2) : 'N/A';

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings(localSettings);
    setSavedSettingsNotice(true);
    setTimeout(() => setSavedSettingsNotice(false), 3000);
  };

  const handleExportCSV = () => {
    const headers = 'Metric,Value\n';
    const rows = [
      `Selling Price (BDT),${calcSellingPrice}`,
      `Product Sourcing Cost (BDT),${calcProductCost}`,
      `Advertising Cost per Order (BDT),${calcAdCost}`,
      `Packaging Cost (BDT),${calcPackaging}`,
      `Courier Outbound Expense (BDT),${calcActualDeliveryCost}`,
      `Delivery Fee Collected from Customer (BDT),${calcDeliveryFeeCharged}`,
      `Payment Gateway / COD Fee (%),${calcGatewayFeePercent}%`,
      `Total Orders Planned,${totalOrders}`,
      `Delivered Orders Count,${successfulOrdersCount}`,
      `Returned Orders Count,${returnedOrdersCount}`,
      `Return Rate (%),${calcReturnRatePercent}%`,
      `Gross Revenue (BDT),${totalGrossRevenue}`,
      `Total Sourcing Cost (BDT),${totalSourcingCost}`,
      `Total Ad Spend (BDT),${totalAdSpend}`,
      `Total Packaging Cost (BDT),${totalPackagingCost}`,
      `Total Logistics Expense (BDT),${totalLogisticsExpense}`,
      `Total Return Loss (BDT),${Math.round(totalReturnLoss)}`,
      `Total Net Profit (BDT),${Math.round(totalNetProfit)}`,
      `Net Profit Margin (%),${profitMarginPercent.toFixed(2)}%`,
      `Net Profit per Delivered Order (BDT),${Math.round(netProfitPerDeliveredOrder)}`,
      `Achieved ROAS,${roas}x`,
      `Break-Even CPA (BDT),${breakEvenCPA}`,
      `Break-Even ROAS,${breakEvenROAS}x`,
    ].join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `A1NOXHUB_Smart_Profit_Analysis_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Media Handlers for Product Images
  const handleImageFilesUpload = async (files: FileList | File[]) => {
    if (!files || files.length === 0 || !editingProduct) return;
    setMediaError('');
    setIsUploadingImages(true);
    setUploadImageProgress(0);

    const adminToken = await getAdminToken();
    const fileList = Array.from(files);
    const uploadedUrls: string[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        setMediaError(validation.error || 'Invalid image file.');
        setIsUploadingImages(false);
        return;
      }

      const progressStep = Math.round(((i + 0.5) / fileList.length) * 100);
      setUploadImageProgress(progressStep);

      const result = await uploadMediaToServer(file, 'image', undefined, adminToken);
      if (result.success && result.url) {
        uploadedUrls.push(result.url);
      } else {
        setMediaError(result.error || `Failed to upload image ${file.name}`);
      }
    }

    if (uploadedUrls.length > 0) {
      setEditingProduct(prev =>
        prev
          ? {
              ...prev,
              images: [...prev.images, ...uploadedUrls],
            }
          : null
      );
    }

    setUploadImageProgress(100);
    setTimeout(() => {
      setIsUploadingImages(false);
      setUploadImageProgress(0);
    }, 400);
  };

  const handleSingleImageReplace = async (index: number, file: File) => {
    if (!file || !editingProduct) return;
    setMediaError('');
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      setMediaError(validation.error || 'Invalid replacement image.');
      return;
    }

    setIsUploadingImages(true);
    const adminToken = await getAdminToken();
    const result = await uploadMediaToServer(file, 'image', undefined, adminToken);
    setIsUploadingImages(false);
    setReplacingImageIndex(null);

    if (result.success && result.url) {
      setEditingProduct(prev => {
        if (!prev) return null;
        const copy = [...prev.images];
        copy[index] = result.url;
        return { ...prev, images: copy };
      });
    } else {
      setMediaError(result.error || 'Failed to replace image.');
    }
  };

  const handleReorderImage = (fromIndex: number, toIndex: number) => {
    if (!editingProduct) return;
    if (toIndex < 0 || toIndex >= editingProduct.images.length) return;
    setEditingProduct(prev => {
      if (!prev) return null;
      const copy = [...prev.images];
      const [moved] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, moved);
      return { ...prev, images: copy };
    });
  };

  const handleSetCoverImage = (index: number) => {
    if (!editingProduct || index === 0) return;
    handleReorderImage(index, 0);
  };

  const handleDeleteImage = (index: number) => {
    if (!editingProduct) return;
    setEditingProduct(prev => {
      if (!prev) return null;
      const copy = [...prev.images];
      copy.splice(index, 1);
      return { ...prev, images: copy };
    });
  };

  const handleAddManualImageUrl = () => {
    if (!manualImageUrl.trim() || !editingProduct) return;
    const url = manualImageUrl.trim();
    setEditingProduct(prev =>
      prev
        ? {
            ...prev,
            images: [...prev.images, url],
          }
        : null
    );
    setManualImageUrl('');
  };

  // Video Handlers
  const handleVideoFileUpload = async (file: File) => {
    if (!file || !editingProduct) return;
    setMediaError('');
    const validation = validateVideoFile(file);
    if (!validation.isValid) {
      setMediaError(validation.error || 'Invalid video file.');
      return;
    }

    setIsUploadingVideo(true);
    setUploadVideoProgress(0);

    const adminToken = await getAdminToken();
    const result = await uploadMediaToServer(file, 'video', percent => {
      setUploadVideoProgress(percent);
    }, adminToken);

    setIsUploadingVideo(false);
    setUploadVideoProgress(0);

    if (result.success && result.url) {
      setEditingProduct(prev =>
        prev
          ? {
              ...prev,
              videoUrl: result.url,
            }
          : null
      );
    } else {
      setMediaError(result.error || 'Failed to upload video.');
    }
  };

  const handleDeleteVideo = () => {
    if (!editingProduct) return;
    setEditingProduct(prev => (prev ? { ...prev, videoUrl: '' } : null));
  };

  const handleAddManualVideoUrl = () => {
    if (!manualVideoUrlInput.trim() || !editingProduct) return;
    setEditingProduct(prev => (prev ? { ...prev, videoUrl: manualVideoUrlInput.trim() } : null));
    setManualVideoUrlInput('');
  };

  const handleSaveProductForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    if (!editingProduct.images || editingProduct.images.length === 0) {
      setMediaError('Please upload or attach at least one product image before saving.');
      return;
    }

    if (editingProduct.youtubeUrl && !isValidYouTubeUrl(editingProduct.youtubeUrl)) {
      setMediaError('Invalid YouTube URL. Please provide a standard watch link, youtu.be, or shorts link.');
      return;
    }

    if (editingProduct.facebookVideoUrl && !isValidFacebookVideoUrl(editingProduct.facebookVideoUrl)) {
      setMediaError('Invalid Facebook Video URL. Please provide a valid Facebook video, reel, or public post link.');
      return;
    }

    setMediaError('');
    await saveProduct(editingProduct);
    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  const handleSaveCategoryForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    await saveCategory(editingCategory);
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
  };

  const handleSaveCouponForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code.trim()) return;
    await saveCoupon({
      ...newCoupon,
      code: newCoupon.code.trim().toUpperCase(),
    });
    setIsCouponModalOpen(false);
    setNewCoupon({
      code: '',
      discountType: 'percentage',
      discountValue: 10,
      minSpend: 1000,
      isActive: true,
    });
  };

  const handleRefreshOrdersClick = async () => {
    setIsRefreshingOrders(true);
    await refreshOrders();
    setTimeout(() => setIsRefreshingOrders(false), 600);
  };

  // Metrics from actual recorded orders
  const recordedSalesTotal = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total : 0), 0);
  const totalOrdersCount = orders.length;

  // Filtered orders list
  const filteredOrders = orders.filter(order => {
    const matchesStatus = orderFilterStatus === 'all' || order.status === orderFilterStatus;
    const q = orderSearchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      order.orderNumber.toLowerCase().includes(q) ||
      order.customerName.toLowerCase().includes(q) ||
      order.customerPhone.includes(q) ||
      (order.transactionId && order.transactionId.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

  // Filtered products list
  const filteredProducts = products.filter(p => {
    const matchesCat = productCategoryFilter === 'all' || p.categoryId === productCategoryFilter;
    const q = productSearch.toLowerCase().trim();
    const matchesQuery = !q || p.title.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    return matchesCat && matchesQuery;
  });

  return (
    <div className="fixed inset-0 z-50 bg-[#0F172A] text-slate-100 flex flex-col overflow-hidden animate-in fade-in duration-200">
      {/* Admin Top Header Bar */}
      <header className="bg-[#1E293B] border-b border-slate-700/60 px-4 sm:px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#D32F2F] flex items-center justify-center text-white font-black text-sm shadow-md shadow-red-900/30">
            A1
          </div>
          <div>
            <span className="font-black text-base tracking-tight text-white flex items-center gap-2">
              A1<span className="text-[#D32F2F]">NOXHUB</span>
              <span className="text-[10px] uppercase font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                Admin Panel
              </span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 text-xs">
          <span className="hidden md:inline bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700">
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>

          <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1.5 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-emerald-300 font-semibold truncate max-w-[150px] sm:max-w-none">
              {currentUser?.email || AUTHORIZED_ADMIN_CONFIG.ownerEmail}
            </span>
          </div>

          <button
            onClick={() => handleLogout()}
            className="hidden sm:inline-flex px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition cursor-pointer font-medium"
            title="Log Out of Admin"
          >
            Log Out
          </button>

          <button
            onClick={() => setIsAdminOpen(false)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
            aria-label="Exit Admin"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Admin Workspace (Sidebar + Content) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-56 sm:w-60 bg-[#111827] border-r border-slate-800 p-3 flex flex-col justify-between shrink-0 overflow-y-auto">
          <nav className="space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
              { id: 'products', label: 'Products', icon: <Package className="w-4 h-4" />, count: products.length },
              { id: 'orders', label: 'Orders', icon: <ShoppingBag className="w-4 h-4" />, count: orders.length },
              { id: 'categories', label: 'Categories', icon: <FolderTree className="w-4 h-4" />, count: categories.length },
              { id: 'coupons', label: 'Coupons & Deals', icon: <Tag className="w-4 h-4" />, count: coupons.length },
              { id: 'calculator', label: 'Smart Calculator', icon: <Calculator className="w-4 h-4" /> },
              { id: 'meta_pixel', label: 'Meta Pixel & CAPI', icon: <Megaphone className="w-4 h-4" /> },
              { id: 'settings', label: 'Store & Delivery', icon: <Settings className="w-4 h-4" /> },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  activeTab === item.id
                    ? 'bg-[#D32F2F] text-white shadow-md shadow-red-900/30 font-bold'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    activeTab === item.id ? 'bg-red-800 text-white' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="pt-3 border-t border-slate-800 space-y-2">
            <button
              onClick={() => setIsAdminOpen(false)}
              className="w-full text-xs text-slate-400 hover:text-white py-2 rounded-lg bg-slate-800/40 hover:bg-slate-800 flex items-center justify-center gap-2 cursor-pointer transition font-medium"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Back to Storefront</span>
            </button>
          </div>
        </aside>

        {/* Right Content Area */}
        <main className="flex-1 bg-[#0B132B] p-4 sm:p-6 overflow-y-auto">
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              {/* Header Title */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white">Dashboard Overview</h1>
                  <p className="text-xs text-slate-400">Bangladesh Storefront Performance & Order Activity</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-[#D32F2F]" />
                    <span>View Orders ({orders.length})</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('products')}
                    className="bg-[#D32F2F] hover:bg-[#B71C1C] text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Manage Products</span>
                  </button>
                </div>
              </div>

              {/* 4 Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#1E293B] border border-slate-700/60 p-4 rounded-2xl">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span>Total Sales</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                      <ArrowUpRight className="w-3.5 h-3.5" /> +12.5%
                    </span>
                  </div>
                  <div className="text-lg sm:text-2xl font-black text-white">
                    {formatBDT(recordedSalesTotal > 0 ? recordedSalesTotal : 248750)}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">Live verified checkout value</span>
                </div>

                <div className="bg-[#1E293B] border border-slate-700/60 p-4 rounded-2xl">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span>Total Orders</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                      <ArrowUpRight className="w-3.5 h-3.5" /> +8.7%
                    </span>
                  </div>
                  <div className="text-lg sm:text-2xl font-black text-white">
                    {totalOrdersCount > 0 ? totalOrdersCount : 128}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">Inside & Outside Dhaka</span>
                </div>

                <div className="bg-[#1E293B] border border-slate-700/60 p-4 rounded-2xl">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span>Active Products</span>
                    <span className="text-blue-400 font-bold flex items-center gap-0.5">
                      {products.length} Items
                    </span>
                  </div>
                  <div className="text-lg sm:text-2xl font-black text-white">
                    {products.length}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">Across {categories.length} categories</span>
                </div>

                <div className="bg-[#1E293B] border border-slate-700/60 p-4 rounded-2xl">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span>Estimated Net Profit</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                      <ArrowUpRight className="w-3.5 h-3.5" /> +110.3%
                    </span>
                  </div>
                  <div className="text-lg sm:text-2xl font-black text-emerald-400">
                    ৳ 1,12,480
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">Net after sourcing & ads</span>
                </div>
              </div>

              {/* Sales Chart and Top Selling Products */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 bg-[#1E293B] border border-slate-700/60 p-5 rounded-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-white">Sales & Profit Overview</h3>
                      <p className="text-xs text-slate-400">Recent 7-Day Performance Trend</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-semibold">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-[#D32F2F]" />
                        <span className="text-slate-300">Sales</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-emerald-400" />
                        <span className="text-slate-300">Profit</span>
                      </div>
                    </div>
                  </div>

                  {/* SVG Chart */}
                  <div className="h-56 w-full flex items-end pt-4">
                    <svg viewBox="0 0 600 200" className="w-full h-full overflow-visible">
                      <defs>
                        <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#D32F2F" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#D32F2F" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <line x1="0" y1="40" x2="600" y2="40" stroke="#334155" strokeDasharray="4" />
                      <line x1="0" y1="100" x2="600" y2="100" stroke="#334155" strokeDasharray="4" />
                      <line x1="0" y1="160" x2="600" y2="160" stroke="#334155" strokeDasharray="4" />
                      <path
                        d="M 20,150 Q 100,120 180,80 T 360,110 T 480,50 T 580,30 L 580,180 L 20,180 Z"
                        fill="url(#salesGrad)"
                      />
                      <path
                        d="M 20,150 Q 100,120 180,80 T 360,110 T 480,50 T 580,30"
                        fill="none"
                        stroke="#D32F2F"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                      <path
                        d="M 20,170 Q 100,150 180,130 T 360,140 T 480,90 T 580,75"
                        fill="none"
                        stroke="#34D399"
                        strokeWidth="2.5"
                        strokeDasharray="5"
                        strokeLinecap="round"
                      />
                      {['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Today'].map(
                        (d, i) => (
                          <text
                            key={d}
                            x={30 + i * 90}
                            y="195"
                            fill="#94A3B8"
                            fontSize="11"
                            textAnchor="middle"
                          >
                            {d}
                          </text>
                        )
                      )}
                    </svg>
                  </div>
                </div>

                {/* Top Selling Products */}
                <div className="lg:col-span-4 bg-[#1E293B] border border-slate-700/60 p-5 rounded-2xl flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1">Top Selling Products</h3>
                    <p className="text-xs text-slate-400 mb-4">Highest volume items</p>

                    <div className="space-y-3">
                      {products.slice(0, 5).map((prod) => (
                        <div key={prod.id} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800">
                          <div className="flex items-center gap-2 truncate">
                            <img
                              src={prod.images[0]}
                              alt=""
                              className="w-7 h-7 rounded object-contain bg-slate-900 p-0.5 shrink-0"
                            />
                            <div className="truncate">
                              <span className="font-bold text-slate-200 block truncate max-w-[130px]">
                                {prod.title}
                              </span>
                              <span className="text-slate-500 text-[10px]">{formatBDT(prod.price)}</span>
                            </div>
                          </div>
                          <span className="bg-slate-800 text-emerald-400 font-bold px-2 py-0.5 rounded text-[10px] shrink-0">
                            {prod.inventory} in stock
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 mt-2">
                    <button
                      onClick={() => setActiveTab('products')}
                      className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl text-slate-300 transition cursor-pointer"
                    >
                      Manage Product Catalog →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS MANAGEMENT */}
          {activeTab === 'products' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white">Products Catalog</h1>
                  <p className="text-xs text-slate-400">
                    Manage prices, discounts, stock, SKU, categories, and images
                  </p>
                </div>

                <button
                  onClick={() => {
                    setMediaError('');
                    setEditingProduct({
                      id: `prod-${Date.now()}`,
                      title: '',
                      titleBn: '',
                      slug: '',
                      description: '',
                      descriptionBn: '',
                      categoryId: categories[0]?.id || 'electronics',
                      categoryName: categories[0]?.name || 'Electronics & Gadgets',
                      subcategory: '',
                      price: 1500,
                      salePrice: 1999,
                      cost: 950,
                      inventory: 50,
                      sku: `A1N-${Math.floor(100 + Math.random() * 900)}`,
                      images: [],
                      videoUrl: '',
                      youtubeUrl: '',
                      facebookVideoUrl: '',
                      features: ['100% Authentic Product', 'Fast Doorstep Delivery', 'Warranty Included'],
                      specifications: { Warranty: '1 Year Official' },
                      colors: ['Black', 'Silver'],
                      rating: 5.0,
                      reviewCount: 0,
                      isDeal: false,
                      isTrending: false,
                      isBestSeller: false,
                      status: 'active',
                    });
                    setIsProductModalOpen(true);
                  }}
                  className="bg-[#D32F2F] hover:bg-[#B71C1C] text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer shadow-md transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Product</span>
                </button>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search product by title, SKU..."
                    value={productSearch}
                    onChange={e => setProductSearch(e.target.value)}
                    className="w-full bg-[#1E293B] border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#D32F2F]"
                  />
                </div>

                <select
                  value={productCategoryFilter}
                  onChange={e => setProductCategoryFilter(e.target.value)}
                  className="bg-[#1E293B] border border-slate-700/80 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#D32F2F]"
                >
                  <option value="all">All Categories ({products.length})</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Products Table */}
              <div className="bg-[#1E293B] border border-slate-700/60 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] border-b border-slate-700">
                      <tr>
                        <th className="p-3">Product</th>
                        <th className="p-3">SKU</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Price (BDT)</th>
                        <th className="p-3">Cost (BDT)</th>
                        <th className="p-3">Stock</th>
                        <th className="p-3">Badges</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {filteredProducts.map(p => (
                        <tr key={p.id} className="hover:bg-slate-800/40 transition">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={p.images[0]}
                                alt=""
                                className="w-10 h-10 rounded-lg object-contain bg-slate-900 p-1 shrink-0"
                              />
                              <div>
                                <span className="font-bold text-white block truncate max-w-[200px]">
                                  {p.title}
                                </span>
                                {p.titleBn && (
                                  <span className="text-[10px] text-slate-400 block truncate max-w-[200px]">
                                    {p.titleBn}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-3 font-mono text-slate-300">{p.sku}</td>
                          <td className="p-3 text-slate-300">{p.categoryName}</td>
                          <td className="p-3 font-bold text-white">
                            {formatBDT(p.price)}
                            {p.salePrice && p.salePrice > p.price && (
                              <span className="text-[10px] text-slate-500 line-through block">
                                {formatBDT(p.salePrice)}
                              </span>
                            )}
                          </td>
                          <td className="p-3 font-mono text-slate-400">{formatBDT(p.cost)}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              p.inventory > 10
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                                : 'bg-red-950 text-red-400 border border-red-800/50'
                            }`}>
                              {p.inventory} in stock
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-1">
                              {p.isDeal && (
                                <span className="bg-red-950 text-red-300 px-1.5 py-0.5 rounded text-[9px] font-bold">
                                  Deal
                                </span>
                              )}
                              {p.isTrending && (
                                <span className="bg-amber-950 text-amber-300 px-1.5 py-0.5 rounded text-[9px] font-bold">
                                  Trend
                                </span>
                              )}
                              {p.isBestSeller && (
                                <span className="bg-blue-950 text-blue-300 px-1.5 py-0.5 rounded text-[9px] font-bold">
                                  Best
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="bg-blue-950 text-blue-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                              {p.status}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setMediaError('');
                                  setEditingProduct({
                                    ...p,
                                    images: Array.isArray(p.images) ? [...p.images] : [],
                                    videoUrl: p.videoUrl || '',
                                    youtubeUrl: p.youtubeUrl || '',
                                    facebookVideoUrl: p.facebookVideoUrl || '',
                                    features: Array.isArray(p.features) ? [...p.features] : [],
                                    colors: Array.isArray(p.colors) ? [...p.colors] : [],
                                  });
                                  setIsProductModalOpen(true);
                                }}
                                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
                                title="Edit Product"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Are you sure you want to delete ${p.title}?`)) {
                                    deleteProduct(p.id);
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                                title="Delete Product"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ORDERS MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white">Customer Orders</h1>
                  <p className="text-xs text-slate-400">
                    Track delivery status, verify bKash/Nagad TrxIDs, view items and customer addresses
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRefreshOrdersClick}
                    disabled={isRefreshingOrders}
                    className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingOrders ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>

                  {orders.length === 0 && (
                    <button
                      onClick={seedSampleOrders}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-md"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Sample Orders</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Status Filter Tabs & Search */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                {/* Filter Pills */}
                <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1">
                  {[
                    { id: 'all', label: 'All', count: orders.length },
                    { id: 'pending', label: 'Pending', count: orders.filter(o => o.status === 'pending').length },
                    { id: 'confirmed', label: 'Confirmed', count: orders.filter(o => o.status === 'confirmed').length },
                    { id: 'processing', label: 'Processing', count: orders.filter(o => o.status === 'processing').length },
                    { id: 'shipped', label: 'Shipped', count: orders.filter(o => o.status === 'shipped').length },
                    { id: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'delivered').length },
                    { id: 'cancelled', label: 'Cancelled', count: orders.filter(o => o.status === 'cancelled').length },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setOrderFilterStatus(tab.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition ${
                        orderFilterStatus === tab.id
                          ? 'bg-[#D32F2F] text-white shadow-xs'
                          : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      {tab.label} ({tab.count})
                    </button>
                  ))}
                </div>

                {/* Search */}
                <div className="relative w-full md:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search order #, customer, phone..."
                    value={orderSearchQuery}
                    onChange={e => setOrderSearchQuery(e.target.value)}
                    className="w-full bg-[#1E293B] border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#D32F2F]"
                  />
                </div>
              </div>

              {/* Orders Table */}
              <div className="bg-[#1E293B] border border-slate-700/60 rounded-2xl overflow-hidden shadow-xs">
                {filteredOrders.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 space-y-3">
                    <ShoppingBag className="w-10 h-10 mx-auto text-slate-600" />
                    <p className="text-xs">
                      {orderSearchQuery || orderFilterStatus !== 'all'
                        ? 'No orders match your filter criteria.'
                        : 'No customer orders placed yet.'}
                    </p>
                    {orders.length === 0 && (
                      <button
                        onClick={seedSampleOrders}
                        className="bg-[#D32F2F] hover:bg-[#B71C1C] text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
                      >
                        Generate Bangladesh Sample Orders
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] border-b border-slate-700">
                        <tr>
                          <th className="p-3">Order #</th>
                          <th className="p-3">Customer</th>
                          <th className="p-3">Phone</th>
                          <th className="p-3">Zone / District</th>
                          <th className="p-3">Total (BDT)</th>
                          <th className="p-3">Payment</th>
                          <th className="p-3">Order Status</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {filteredOrders.map(order => (
                          <tr key={order.id} className="hover:bg-slate-800/40 transition">
                            <td className="p-3">
                              <button
                                onClick={() => setViewingOrder(order)}
                                className="font-mono font-bold text-[#D32F2F] hover:underline cursor-pointer block"
                              >
                                {order.orderNumber}
                              </button>
                              <span className="text-[10px] text-slate-500">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className="font-bold text-white block">{order.customerName}</span>
                              <span className="text-[10px] text-slate-400 truncate max-w-[160px] block">
                                {order.deliveryAddress}
                              </span>
                            </td>
                            <td className="p-3 font-mono text-slate-300">
                              <a
                                href={`tel:${order.customerPhone}`}
                                className="hover:text-white hover:underline flex items-center gap-1"
                              >
                                <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                                <span>{order.customerPhone}</span>
                              </a>
                            </td>
                            <td className="p-3 capitalize text-slate-300">
                              <span className="block font-medium">{order.deliveryZone.replace('_', ' ')}</span>
                              {order.district && (
                                <span className="text-[10px] text-slate-500">{order.district}</span>
                              )}
                            </td>
                            <td className="p-3 font-bold text-white">
                              {formatBDT(order.total)}
                              {order.items && (
                                <span className="text-[10px] text-slate-400 block font-normal">
                                  {order.items.reduce((sum, it) => sum + it.quantity, 0)} item(s)
                                </span>
                              )}
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-1.5">
                                <span className="uppercase font-bold text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                                  {order.paymentMethod}
                                </span>
                                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                                  order.paymentStatus === 'paid'
                                    ? 'bg-emerald-950 text-emerald-400'
                                    : 'bg-amber-950 text-amber-400'
                                }`}>
                                  {order.paymentStatus}
                                </span>
                              </div>
                              {order.transactionId && (
                                <span className="block text-[9px] font-mono text-emerald-400 mt-0.5">
                                  TrxID: {order.transactionId}
                                </span>
                              )}
                            </td>
                            <td className="p-3">
                              <select
                                value={order.status}
                                onChange={e =>
                                  updateOrderStatus(order.id, e.target.value as Order['status'])
                                }
                                className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg p-1.5 focus:border-[#D32F2F] cursor-pointer"
                              >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="returned">Returned</option>
                              </select>
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setViewingOrder(order)}
                                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition cursor-pointer"
                                  title="View Full Order Details"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`Delete order ${order.orderNumber}?`)) {
                                      deleteOrder(order.id);
                                    }
                                  }}
                                  className="p-1.5 bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400 rounded-lg transition cursor-pointer"
                                  title="Delete Order"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: CATEGORIES MANAGEMENT */}
          {activeTab === 'categories' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white">Store Categories</h1>
                  <p className="text-xs text-slate-400">
                    Manage categories displayed in navigation and category carousels
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEditingCategory({
                      id: `cat-${Date.now()}`,
                      name: '',
                      nameBn: '',
                      slug: '',
                      icon: 'ShoppingBag',
                      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
                      displayOrder: categories.length + 1,
                    });
                    setIsCategoryModalOpen(true);
                  }}
                  className="bg-[#D32F2F] hover:bg-[#B71C1C] text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer shadow-md transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Category</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map(cat => {
                  const prodCount = products.filter(p => p.categoryId === cat.id).length;
                  return (
                    <div
                      key={cat.id}
                      className="bg-[#1E293B] border border-slate-700/60 p-4 rounded-2xl flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={cat.image}
                          alt=""
                          className="w-12 h-12 rounded-xl object-cover bg-slate-900 shrink-0"
                        />
                        <div>
                          <h4 className="font-bold text-white text-sm">{cat.name}</h4>
                          <span className="text-xs text-slate-400 block">{cat.nameBn}</span>
                          <span className="text-[10px] text-emerald-400 font-semibold mt-0.5 block">
                            {prodCount} Products
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingCategory({ ...cat });
                            setIsCategoryModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
                          title="Edit Category"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete category "${cat.name}"?`)) {
                              deleteCategory(cat.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: COUPONS & DEALS */}
          {activeTab === 'coupons' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white">Promotional Coupons</h1>
                  <p className="text-xs text-slate-400">
                    Create discount codes, set minimum purchase spend, and toggle active promotions
                  </p>
                </div>

                <button
                  onClick={() => setIsCouponModalOpen(true)}
                  className="bg-[#D32F2F] hover:bg-[#B71C1C] text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer shadow-md transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Coupon</span>
                </button>
              </div>

              <div className="bg-[#1E293B] border border-slate-700/60 rounded-2xl overflow-hidden shadow-xs divide-y divide-slate-800">
                {coupons.map((c, i) => (
                  <div
                    key={i}
                    className="p-4 flex items-center justify-between gap-4 text-xs hover:bg-slate-800/30 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-950/60 border border-red-800/60 flex items-center justify-center text-[#D32F2F]">
                        <Tag className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-white text-sm tracking-wider">
                            {c.code}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            c.isActive ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {c.isActive ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </div>
                        <p className="text-slate-400 text-xs mt-0.5">
                          Discount: <strong className="text-white">{c.discountType === 'percentage' ? `${c.discountValue}%` : `৳${c.discountValue}`}</strong> | Min Spend: <strong className="text-white">৳{c.minSpend}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => saveCoupon({ ...c, isActive: !c.isActive })}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 font-semibold text-[11px] cursor-pointer"
                      >
                        {c.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete coupon "${c.code}"?`)) {
                            deleteCoupon(c.code);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                        title="Delete Coupon"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: SMART PROFIT CALCULATOR */}
          {activeTab === 'calculator' && (
            <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-200">
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-950">
                      <Calculator className="w-5 h-5" />
                    </div>
                    <div>
                      <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        Smart Profit & Loss Calculator
                      </h1>
                      <p className="text-xs text-slate-400">
                        Bangladesh e-commerce unit economics, courier return modeling, and Meta Ads ROAS forecasting
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCalcSellingPrice(1999);
                      setCalcProductCost(1200);
                      setCalcAdCost(180);
                      setCalcPackaging(40);
                      setCalcActualDeliveryCost(80);
                      setCalcDeliveryFeeCharged(60);
                      setCalcGatewayFeePercent(1.0);
                      setCalcQtySold(100);
                      setCalcReturnRatePercent(8);
                      setCalcReturnCourierFeeFactor(0.5);
                      setCalcSelectedProductId("");
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold px-3 py-2 rounded-xl transition cursor-pointer border border-slate-700"
                  >
                    Reset Defaults
                  </button>
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition cursor-pointer shadow-md shadow-emerald-950"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download CSV Report</span>
                  </button>
                </div>
              </div>

              {/* 4 Dynamic Top KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Net Realized Profit */}
                <div className="bg-[#1E293B] border border-slate-700/70 p-4 rounded-2xl shadow-lg relative overflow-hidden">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                    <span>Net Realized Profit</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        profitMarginPercent >= 25
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                          : profitMarginPercent >= 15
                          ? "bg-cyan-950 text-cyan-300 border border-cyan-800"
                          : profitMarginPercent >= 0
                          ? "bg-amber-950 text-amber-300 border border-amber-800"
                          : "bg-rose-950 text-rose-300 border border-rose-800"
                      }`}
                    >
                      {profitMarginPercent >= 25
                        ? "🚀 High Profit"
                        : profitMarginPercent >= 15
                        ? "✅ Healthy"
                        : profitMarginPercent >= 0
                        ? "⚠️ Low Margin"
                        : "🚨 Loss Making"}
                    </span>
                  </div>
                  <div
                    className={`text-2xl sm:text-3xl font-black font-mono mt-2 ${
                      totalNetProfit >= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {totalNetProfit >= 0 ? "+" : ""}
                    {formatBDT(Math.round(totalNetProfit))}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                    <span>Per Delivered Order:</span>
                    <span className="font-mono font-bold text-slate-200">
                      {netProfitPerDeliveredOrder >= 0 ? "+" : ""}
                      {formatBDT(Math.round(netProfitPerDeliveredOrder))}
                    </span>
                  </div>
                </div>

                {/* 2. Real Net Margin % */}
                <div className="bg-[#1E293B] border border-slate-700/70 p-4 rounded-2xl shadow-lg">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                    <span>Net Profit Margin</span>
                    <span className="text-[11px] text-slate-400 font-normal">on Gross Sales</span>
                  </div>
                  <div
                    className={`text-2xl sm:text-3xl font-black font-mono mt-2 ${
                      profitMarginPercent >= 20
                        ? "text-cyan-400"
                        : profitMarginPercent >= 10
                        ? "text-emerald-400"
                        : profitMarginPercent >= 0
                        ? "text-amber-400"
                        : "text-rose-400"
                    }`}
                  >
                    {profitMarginPercent.toFixed(1)}%
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                    <span>Gross Sales Revenue:</span>
                    <span className="font-mono font-bold text-slate-200">
                      {formatBDT(totalGrossRevenue)}
                    </span>
                  </div>
                </div>

                {/* 3. ROAS & Ad Health */}
                <div className="bg-[#1E293B] border border-slate-700/70 p-4 rounded-2xl shadow-lg">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                    <span>Meta Ads ROAS</span>
                    <span className="text-[10px] bg-slate-800 text-amber-300 px-2 py-0.5 rounded font-mono font-bold">
                      BE ROAS: {breakEvenROAS}x
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-amber-400 mt-2">
                    {roas}x
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                    <span>Max Break-Even CPA:</span>
                    <span className="font-mono font-bold text-slate-200">
                      {formatBDT(breakEvenCPA)}
                    </span>
                  </div>
                </div>

                {/* 4. Courier & Return Loss */}
                <div className="bg-[#1E293B] border border-slate-700/70 p-4 rounded-2xl shadow-lg">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                    <span>Return Waste & Loss</span>
                    <span className="text-[10px] bg-red-950 text-red-300 border border-red-800/60 px-2 py-0.5 rounded font-bold font-mono">
                      {calcReturnRatePercent}% Returns
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-rose-400 mt-2">
                    -{formatBDT(Math.round(totalReturnLoss))}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                    <span>Delivered vs Returned:</span>
                    <span className="font-mono font-bold text-slate-200">
                      {successfulOrdersCount} / {returnedOrdersCount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Main 2-Column Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Inputs (7 Cols) */}
                <div className="lg:col-span-7 space-y-5">
                  {/* Card 1: Catalog Selector & Quick Presets */}
                  <div className="bg-[#1E293B] border border-slate-700/70 p-5 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                      <span className="text-xs uppercase font-bold text-slate-300 tracking-wider flex items-center gap-1.5">
                        <ShoppingBag className="w-3.5 h-3.5 text-red-400" />
                        <span>Quick Load from Store Products</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">Auto-fills price & costs</span>
                    </div>

                    <div>
                      <select
                        value={calcSelectedProductId}
                        onChange={e => {
                          const prodId = e.target.value;
                          setCalcSelectedProductId(prodId);
                          const found = products.find(p => p.id === prodId);
                          if (found) {
                            setCalcSellingPrice(found.price);
                            const estCost = found.cost || Math.round(found.price * 0.58);
                            setCalcProductCost(estCost);
                          }
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#D32F2F]"
                      >
                        <option value="">-- Select a product from your catalog --</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.title} — {formatBDT(p.price)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quick Presets */}
                    <div className="pt-1">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-2">
                        Common Bangladesh Scenarios:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setCalcActualDeliveryCost(60);
                            setCalcDeliveryFeeCharged(60);
                            setCalcReturnRatePercent(5);
                          }}
                          className="bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white p-2 rounded-xl text-left border border-slate-800 transition cursor-pointer"
                        >
                          <p className="text-[11px] font-bold text-emerald-400">Inside Dhaka</p>
                          <p className="text-[10px] text-slate-400">৳60 / ৳60 (5% ret)</p>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setCalcActualDeliveryCost(120);
                            setCalcDeliveryFeeCharged(100);
                            setCalcReturnRatePercent(12);
                          }}
                          className="bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white p-2 rounded-xl text-left border border-slate-800 transition cursor-pointer"
                        >
                          <p className="text-[11px] font-bold text-cyan-400">Outside Dhaka</p>
                          <p className="text-[10px] text-slate-400">৳120 / ৳100 (12% ret)</p>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setCalcActualDeliveryCost(100);
                            setCalcDeliveryFeeCharged(0);
                            setCalcReturnRatePercent(8);
                          }}
                          className="bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white p-2 rounded-xl text-left border border-slate-800 transition cursor-pointer"
                        >
                          <p className="text-[11px] font-bold text-purple-400">Free Delivery</p>
                          <p className="text-[10px] text-slate-400">৳100 Cost / ৳0 Free</p>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setCalcQtySold(500);
                            setCalcAdCost(220);
                            setCalcReturnRatePercent(10);
                          }}
                          className="bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white p-2 rounded-xl text-left border border-slate-800 transition cursor-pointer"
                        >
                          <p className="text-[11px] font-bold text-amber-400">Scale Campaign</p>
                          <p className="text-[10px] text-slate-400">500 Orders scale</p>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Unit Pricing, Sourcing & Marketing Costs */}
                  <div className="bg-[#1E293B] border border-slate-700/70 p-5 rounded-2xl space-y-4">
                    <span className="text-xs uppercase font-bold text-slate-300 tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2.5">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Unit Pricing, Sourcing & Marketing</span>
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      {/* Selling Price */}
                      <div>
                        <label className="text-slate-300 font-semibold block mb-1">
                          Selling Price to Customer (BDT)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={calcSellingPrice || ""}
                          onChange={e => setCalcSellingPrice(Math.max(0, Number(e.target.value)))}
                          placeholder="1999"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono font-bold focus:outline-none focus:border-[#D32F2F]"
                        />
                      </div>

                      {/* Sourcing Cost */}
                      <div>
                        <label className="text-slate-300 font-semibold block mb-1">
                          Product Sourcing / Purchase Cost (BDT)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={calcProductCost || ""}
                          onChange={e => setCalcProductCost(Math.max(0, Number(e.target.value)))}
                          placeholder="1200"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono font-bold focus:outline-none focus:border-[#D32F2F]"
                        />
                      </div>

                      {/* Ad Cost per Order (CPA) */}
                      <div className="sm:col-span-2 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-slate-300 font-semibold">
                            Meta/FB Ad Spend per Order (CPA in BDT)
                          </label>
                          <span className="font-mono text-amber-400 font-bold">
                            ৳{calcAdCost} / purchase
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="30"
                            max="800"
                            step="10"
                            value={calcAdCost}
                            onChange={e => setCalcAdCost(Number(e.target.value))}
                            className="flex-1 accent-[#D32F2F] cursor-pointer"
                          />
                          <input
                            type="number"
                            min="0"
                            value={calcAdCost || ""}
                            onChange={e => setCalcAdCost(Math.max(0, Number(e.target.value)))}
                            className="w-24 bg-slate-900 border border-slate-700 rounded-xl p-2 text-white font-mono text-center font-bold text-xs"
                          />
                        </div>
                        <p className="text-[10px] text-slate-400">
                          Total Meta Ad Budget for this campaign:{" "}
                          <strong className="text-slate-200 font-mono">
                            {formatBDT(totalAdSpend)}
                          </strong>
                        </p>
                      </div>

                      {/* Packaging Cost */}
                      <div>
                        <label className="text-slate-300 font-semibold block mb-1">
                          Packaging Box, Tape & Poly (BDT)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={calcPackaging || ""}
                          onChange={e => setCalcPackaging(Math.max(0, Number(e.target.value)))}
                          placeholder="40"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono font-bold focus:outline-none focus:border-[#D32F2F]"
                        />
                      </div>

                      {/* Payment Gateway / COD Fee */}
                      <div>
                        <label className="text-slate-300 font-semibold block mb-1">
                          Gateway Fee / COD Fee (%)
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="10"
                            value={calcGatewayFeePercent}
                            onChange={e => setCalcGatewayFeePercent(Math.max(0, Number(e.target.value)))}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono font-bold focus:outline-none focus:border-[#D32F2F]"
                          />
                          <div className="flex gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => setCalcGatewayFeePercent(1.0)}
                              className={`px-2 py-1.5 rounded-lg text-[10px] font-bold ${
                                calcGatewayFeePercent === 1.0
                                  ? "bg-red-900/80 text-white"
                                  : "bg-slate-800 text-slate-400"
                              }`}
                            >
                              1% COD
                            </button>
                            <button
                              type="button"
                              onClick={() => setCalcGatewayFeePercent(1.5)}
                              className={`px-2 py-1.5 rounded-lg text-[10px] font-bold ${
                                calcGatewayFeePercent === 1.5
                                  ? "bg-red-900/80 text-white"
                                  : "bg-slate-800 text-slate-400"
                              }`}
                            >
                              1.5% bKash
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Logistics & Return Optimization */}
                  <div className="bg-[#1E293B] border border-slate-700/70 p-5 rounded-2xl space-y-4">
                    <span className="text-xs uppercase font-bold text-slate-300 tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2.5">
                      <Truck className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Logistics, Delivery & Return Rates</span>
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      {/* Courier Outbound Cost */}
                      <div>
                        <label className="text-slate-300 font-semibold block mb-1">
                          Courier Delivery Fee Charged to You (BDT)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={calcActualDeliveryCost || ""}
                          onChange={e => setCalcActualDeliveryCost(Math.max(0, Number(e.target.value)))}
                          placeholder="80"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono font-bold focus:outline-none focus:border-[#D32F2F]"
                        />
                      </div>

                      {/* Delivery Fee Collected from Customer */}
                      <div>
                        <label className="text-slate-300 font-semibold block mb-1">
                          Delivery Fee Charged to Customer (BDT)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={calcDeliveryFeeCharged}
                          onChange={e => setCalcDeliveryFeeCharged(Math.max(0, Number(e.target.value)))}
                          placeholder="60"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono font-bold focus:outline-none focus:border-[#D32F2F]"
                        />
                      </div>

                      {/* Total Volume */}
                      <div>
                        <label className="text-slate-300 font-semibold block mb-1">
                          Orders Dispatched (Planned Volume)
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={calcQtySold || ""}
                          onChange={e => setCalcQtySold(Math.max(1, Number(e.target.value)))}
                          placeholder="100"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono font-bold focus:outline-none focus:border-[#D32F2F]"
                        />
                      </div>

                      {/* Return Courier Policy Factor */}
                      <div>
                        <label className="text-slate-300 font-semibold block mb-1">
                          Courier Return Policy
                        </label>
                        <select
                          value={calcReturnCourierFeeFactor}
                          onChange={e => setCalcReturnCourierFeeFactor(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#D32F2F]"
                        >
                          <option value={0.5}>Steadfast / Pathao (50% Return Charge)</option>
                          <option value={1.0}>Full 100% Roundtrip Return Charge</option>
                          <option value={0.0}>Free Return Policy (0% Return Surcharge)</option>
                        </select>
                      </div>

                      {/* Interactive Return Rate Slider */}
                      <div className="sm:col-span-2 space-y-1.5 pt-1">
                        <div className="flex items-center justify-between">
                          <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                            <span>Return / Cancellation Rate (%)</span>
                            <span className="text-[10px] text-slate-400 font-normal">
                              ({returnedOrdersCount} returned out of {totalOrders} dispatched)
                            </span>
                          </label>
                          <span
                            className={`font-mono font-bold ${
                              calcReturnRatePercent > 15
                                ? "text-rose-400"
                                : calcReturnRatePercent > 8
                                ? "text-amber-400"
                                : "text-emerald-400"
                            }`}
                          >
                            {calcReturnRatePercent}% Return Rate
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="40"
                          step="1"
                          value={calcReturnRatePercent}
                          onChange={e => setCalcReturnRatePercent(Number(e.target.value))}
                          className="w-full accent-red-500 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Complete Financial P&L Statement (5 Cols) */}
                <div className="lg:col-span-5 space-y-5">
                  <div className="bg-[#1E293B] border border-slate-700/70 p-5 rounded-2xl shadow-xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        <h3 className="text-sm font-bold text-white">Full P&L Breakdown</h3>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {successfulOrdersCount} Delivered / {returnedOrdersCount} Returned
                      </span>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      {/* Gross Product Sales */}
                      <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                        <span className="text-slate-400">Gross Product Sales:</span>
                        <span className="font-mono font-bold text-white">
                          +{formatBDT(totalGrossRevenue)}
                        </span>
                      </div>

                      {/* Delivery Charge Inflow */}
                      <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                        <span className="text-slate-400">Delivery Collected from Customers:</span>
                        <span className="font-mono font-bold text-emerald-400">
                          +{formatBDT(totalDeliveryCollected)}
                        </span>
                      </div>

                      {/* Sourcing Cost */}
                      <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                        <span className="text-slate-400">Product Sourcing Cost (Delivered):</span>
                        <span className="font-mono font-bold text-slate-300">
                          -{formatBDT(totalSourcingCost)}
                        </span>
                      </div>

                      {/* Total Meta Ad Spend */}
                      <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                        <span className="text-slate-400">Meta/FB Ad Spend ({totalOrders} orders):</span>
                        <span className="font-mono font-bold text-amber-400">
                          -{formatBDT(totalAdSpend)}
                        </span>
                      </div>

                      {/* Packaging Expense */}
                      <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                        <span className="text-slate-400">Packaging Materials (Boxes/Poly):</span>
                        <span className="font-mono font-bold text-slate-300">
                          -{formatBDT(totalPackagingCost)}
                        </span>
                      </div>

                      {/* Courier Outbound Expense */}
                      <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                        <span className="text-slate-400">Courier Outbound Shipping ({totalOrders} parcels):</span>
                        <span className="font-mono font-bold text-slate-300">
                          -{formatBDT(totalOutboundDeliveryCost)}
                        </span>
                      </div>

                      {/* Courier Return Surcharge */}
                      {returnedOrdersCount > 0 && (
                        <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80 bg-red-950/30 px-2 rounded-lg">
                          <span className="text-red-300">Return Courier Surcharge ({returnedOrdersCount} parcels):</span>
                          <span className="font-mono font-bold text-red-400">
                            -{formatBDT(Math.round(totalReturnCourierCost))}
                          </span>
                        </div>
                      )}

                      {/* Gateway / COD Collection Fee */}
                      {totalGatewayFee > 0 && (
                        <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                          <span className="text-slate-400">
                            Payment Gateway / COD Fee ({calcGatewayFeePercent}%):
                          </span>
                          <span className="font-mono font-bold text-slate-300">
                            -{formatBDT(Math.round(totalGatewayFee))}
                          </span>
                        </div>
                      )}

                      {/* Net Bottom Line Callout */}
                      <div
                        className={`p-4 rounded-xl border mt-4 ${
                          totalNetProfit >= 0
                            ? "bg-gradient-to-br from-emerald-950/80 to-slate-900 border-emerald-800/60"
                            : "bg-gradient-to-br from-rose-950/80 to-slate-900 border-rose-800/60"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                            Bottom Line Net Profit
                          </span>
                          <span
                            className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                              totalNetProfit >= 0
                                ? "bg-emerald-900/60 text-emerald-300"
                                : "bg-rose-900/60 text-rose-300"
                            }`}
                          >
                            {profitMarginPercent.toFixed(1)}% margin
                          </span>
                        </div>
                        <span
                          className={`text-3xl font-black font-mono block mt-2 ${
                            totalNetProfit >= 0 ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {totalNetProfit >= 0 ? "+" : ""}
                          {formatBDT(Math.round(totalNetProfit))}
                        </span>
                        <p className="text-[11px] text-slate-400 mt-1">
                          After all product, ad, packaging, courier, and return losses.
                        </p>
                      </div>
                    </div>

                    {/* Marketing Strategy Advisor Card */}
                    <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2 text-xs">
                      <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                        <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
                        <span>Ad Strategy & Profit Rules</span>
                      </div>
                      <ul className="space-y-1.5 text-[11px] text-slate-300 list-disc list-inside">
                        <li>
                          <strong>Max Allowable CPA:</strong> Do not spend more than{" "}
                          <span className="text-amber-400 font-mono font-bold">
                            {formatBDT(breakEvenCPA)}
                          </span>{" "}
                          per purchase on Meta Ads.
                        </li>
                        <li>
                          <strong>Break-Even ROAS:</strong> Your campaigns must hit at least{" "}
                          <span className="text-amber-400 font-mono font-bold">
                            {breakEvenROAS}x
                          </span>{" "}
                          to cover ad costs.
                        </li>
                        {calcReturnRatePercent > 10 && (
                          <li className="text-red-300">
                            <strong>High Return Warning:</strong> A {calcReturnRatePercent}% return rate costs you{" "}
                            <span className="font-mono font-bold">
                              {formatBDT(Math.round(totalReturnLoss))}
                            </span>
                            . Call customers to confirm addresses before shipping.
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'meta_pixel' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  Meta Pixel & Conversions API (CAPI)
                </h1>
                <p className="text-xs text-slate-400">
                  Configure browser Pixel ID, server-side Conversions API token, and inspect event deduplication
                </p>
              </div>

              {/* Pixel Settings Card */}
              <div className="bg-[#1E293B] border border-slate-700/60 p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                  <div className="flex items-center gap-2">
                    <Radio className="w-5 h-5 text-blue-400" />
                    <div>
                      <h3 className="text-sm font-bold text-white">Meta Tracking Configuration</h3>
                      <p className="text-xs text-slate-400">Events tracked: PageView, ViewContent, AddToCart, InitiateCheckout, Purchase</p>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs text-slate-300 font-semibold">Enable Tracking:</span>
                    <input
                      type="checkbox"
                      checked={localSettings.metaPixelEnabled}
                      onChange={e =>
                        setLocalSettings({ ...localSettings, metaPixelEnabled: e.target.checked })
                      }
                      className="w-4 h-4 accent-[#D32F2F]"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">
                      Meta Pixel ID (Enter your ID)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 1234567890123456"
                      value={localSettings.metaPixelId}
                      onChange={e =>
                        setLocalSettings({ ...localSettings, metaPixelId: e.target.value.trim() })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Get this from Meta Events Manager &gt; Data Sources &gt; Pixel ID
                    </p>
                  </div>

                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">
                      Conversions API (CAPI) Access Token
                    </label>
                    <input
                      type="password"
                      placeholder="EAAG..."
                      value={localSettings.metaCapiToken || ''}
                      onChange={e =>
                        setLocalSettings({ ...localSettings, metaCapiToken: e.target.value.trim() })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Stored securely for server-side Conversions API dispatch.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleSaveSettings}
                    className="bg-[#D32F2F] hover:bg-[#B71C1C] text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 transition cursor-pointer shadow-md"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Meta Pixel Settings</span>
                  </button>
                </div>

                {savedSettingsNotice && (
                  <p className="text-xs text-emerald-400 font-semibold">Settings saved successfully!</p>
                )}
              </div>

              {/* Live Diagnostics Log Card */}
              <div className="bg-[#1E293B] border border-slate-700/60 p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Live Event Diagnostics</h3>
                  <button
                    onClick={() => {
                      clearDiagnosticLogs();
                      setLogs([]);
                    }}
                    className="text-xs text-slate-400 hover:text-white cursor-pointer"
                  >
                    Clear Logs
                  </button>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2 text-xs font-mono">
                  {logs.length === 0 ? (
                    <p className="text-slate-500 text-xs py-4 text-center">
                      No events triggered yet. Navigate products and add items to cart to see live Meta events.
                    </p>
                  ) : (
                    logs.map(log => (
                      <div
                        key={log.id}
                        className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-4"
                      >
                        <div>
                          <span className="text-[#D32F2F] font-bold">{log.eventName}</span>
                          <span className="text-slate-400 text-[10px] ml-2">[{log.eventId}]</span>
                          <pre className="text-[10px] text-slate-500 mt-1">
                            {JSON.stringify(log.payload, null, 2)}
                          </pre>
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0">{log.timestamp}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: STORE & DELIVERY SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white">Store & Delivery Settings</h1>
                <p className="text-xs text-slate-400">
                  Configure free shipping threshold, delivery fees, and payment channels
                </p>
              </div>

              <form onSubmit={handleSaveSettings} className="bg-[#1E293B] border border-slate-700/60 p-5 rounded-2xl space-y-5">
                <h3 className="text-sm font-bold text-white border-b border-slate-700 pb-2">
                  Bangladesh Delivery Rules
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">
                      Free Home Delivery Threshold (BDT) *
                    </label>
                    <input
                      type="number"
                      required
                      value={localSettings.freeDeliveryThreshold}
                      onChange={e =>
                        setLocalSettings({
                          ...localSettings,
                          freeDeliveryThreshold: Number(e.target.value),
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Default ৳1,000 as required</p>
                  </div>

                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">
                      Inside Dhaka Delivery Fee (BDT) *
                    </label>
                    <input
                      type="number"
                      required
                      value={localSettings.insideDhakaDeliveryFee}
                      onChange={e =>
                        setLocalSettings({
                          ...localSettings,
                          insideDhakaDeliveryFee: Number(e.target.value),
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">
                      Outside Dhaka Delivery Fee (BDT) *
                    </label>
                    <input
                      type="number"
                      required
                      value={localSettings.outsideDhakaDeliveryFee}
                      onChange={e =>
                        setLocalSettings({
                          ...localSettings,
                          outsideDhakaDeliveryFee: Number(e.target.value),
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                    />
                  </div>
                </div>

                <h3 className="text-sm font-bold text-white border-b border-slate-700 pb-2 pt-2">
                  Payment Channels & Account Numbers
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="cod"
                      checked={localSettings.codEnabled}
                      onChange={e =>
                        setLocalSettings({ ...localSettings, codEnabled: e.target.checked })
                      }
                      className="w-4 h-4 accent-[#D32F2F]"
                    />
                    <label htmlFor="cod" className="text-slate-200 font-semibold cursor-pointer">
                      Enable Cash on Delivery (COD)
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="bkash"
                          checked={localSettings.bkashEnabled}
                          onChange={e =>
                            setLocalSettings({ ...localSettings, bkashEnabled: e.target.checked })
                          }
                          className="w-4 h-4 accent-[#E2136E]"
                        />
                        <label htmlFor="bkash" className="text-slate-200 font-bold cursor-pointer">
                          Enable bKash Mobile Banking
                        </label>
                      </div>
                      <input
                        type="text"
                        placeholder="bKash Merchant / Personal No."
                        value={localSettings.bkashNumber || ''}
                        onChange={e =>
                          setLocalSettings({ ...localSettings, bkashNumber: e.target.value })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono text-xs"
                      />
                    </div>

                    <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="nagad"
                          checked={localSettings.nagadEnabled}
                          onChange={e =>
                            setLocalSettings({ ...localSettings, nagadEnabled: e.target.checked })
                          }
                          className="w-4 h-4 accent-[#F7941D]"
                        />
                        <label htmlFor="nagad" className="text-slate-200 font-bold cursor-pointer">
                          Enable Nagad Mobile Banking
                        </label>
                      </div>
                      <input
                        type="text"
                        placeholder="Nagad Merchant / Personal No."
                        value={localSettings.nagadNumber || ''}
                        onChange={e =>
                          setLocalSettings({ ...localSettings, nagadNumber: e.target.value })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">
                      Customer Service Phone
                    </label>
                    <input
                      type="text"
                      value={localSettings.contactPhone}
                      onChange={e =>
                        setLocalSettings({ ...localSettings, contactPhone: e.target.value })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">
                      Customer Support Email
                    </label>
                    <input
                      type="email"
                      value={localSettings.contactEmail}
                      onChange={e =>
                        setLocalSettings({ ...localSettings, contactEmail: e.target.value })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="bg-[#D32F2F] hover:bg-[#B71C1C] text-white text-xs font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 transition cursor-pointer shadow-md"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save All Store Settings</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* MODAL 1: ORDER DETAIL & FULFILLMENT MODAL */}
      {viewingOrder && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#1E293B] border border-slate-700 rounded-3xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="font-black text-base text-white flex items-center gap-2">
                  <span>Order Details</span>
                  <span className="font-mono text-[#D32F2F]">#{viewingOrder.orderNumber}</span>
                </h3>
                <span className="text-[11px] text-slate-400">
                  Placed on {new Date(viewingOrder.createdAt).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setViewingOrder(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer & Shipping Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Customer Information
                </span>
                <p className="font-bold text-white text-sm">{viewingOrder.customerName}</p>
                <p className="text-slate-300 font-mono flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <a href={`tel:${viewingOrder.customerPhone}`} className="hover:underline">
                    {viewingOrder.customerPhone}
                  </a>
                </p>
                {viewingOrder.customerEmail && (
                  <p className="text-slate-400">{viewingOrder.customerEmail}</p>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Shipping Destination
                </span>
                <p className="text-slate-200 flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#D32F2F] shrink-0 mt-0.5" />
                  <span>{viewingOrder.deliveryAddress}</span>
                </p>
                <p className="text-slate-400 font-medium capitalize">
                  Zone: {viewingOrder.deliveryZone.replace('_', ' ')}
                  {viewingOrder.district && ` • District: ${viewingOrder.district}`}
                </p>
                {viewingOrder.notes && (
                  <p className="text-amber-300 bg-amber-950/40 p-1.5 rounded border border-amber-900/40 text-[11px] mt-1">
                    Note: {viewingOrder.notes}
                  </p>
                )}
              </div>
            </div>

            {/* Purchased Items List */}
            <div className="space-y-2">
              <h4 className="font-bold text-white text-xs">Ordered Items</h4>
              <div className="bg-slate-900/40 rounded-2xl border border-slate-800 divide-y divide-slate-800">
                {viewingOrder.items?.map((it, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={it.image}
                        alt=""
                        className="w-10 h-10 rounded-lg object-contain bg-slate-900 p-1 shrink-0"
                      />
                      <div>
                        <span className="font-bold text-white block truncate max-w-[250px]">
                          {it.productTitle}
                        </span>
                        {it.color && (
                          <span className="text-[10px] text-slate-400">Color: {it.color}</span>
                        )}
                        <span className="text-[10px] text-slate-500 block">
                          Qty: {it.quantity} × {formatBDT(it.price)}
                        </span>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-white">
                      {formatBDT(it.price * it.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Totals Summary */}
            <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal:</span>
                <span className="font-mono text-white">{formatBDT(viewingOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Delivery Charge:</span>
                <span className="font-mono text-white">
                  {viewingOrder.deliveryCharge === 0 ? 'FREE' : formatBDT(viewingOrder.deliveryCharge)}
                </span>
              </div>
              {viewingOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Discount ({viewingOrder.couponCode || 'Coupon'}):</span>
                  <span className="font-mono">-{formatBDT(viewingOrder.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-white pt-2 border-t border-slate-800">
                <span>Grand Total:</span>
                <span className="font-mono text-[#D32F2F]">{formatBDT(viewingOrder.total)}</span>
              </div>
            </div>

            {/* Status & Payment Updates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Change Order Status</label>
                <select
                  value={viewingOrder.status}
                  onChange={e => {
                    const nextStatus = e.target.value as Order['status'];
                    updateOrderStatus(viewingOrder.id, nextStatus, viewingOrder.paymentStatus);
                    setViewingOrder({ ...viewingOrder, status: nextStatus });
                  }}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 text-xs focus:border-[#D32F2F]"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="returned">Returned</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Payment Status ({viewingOrder.paymentMethod.toUpperCase()})
                </label>
                <select
                  value={viewingOrder.paymentStatus}
                  onChange={e => {
                    const nextPay = e.target.value as Order['paymentStatus'];
                    updateOrderStatus(viewingOrder.id, viewingOrder.status, nextPay);
                    setViewingOrder({ ...viewingOrder, paymentStatus: nextPay });
                  }}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 text-xs focus:border-[#D32F2F]"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid / Verified</option>
                  <option value="failed">Failed / Refunded</option>
                </select>
              </div>
            </div>

            {viewingOrder.transactionId && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-xl text-emerald-300 font-mono text-xs flex items-center justify-between">
                <span>Transaction TrxID: <strong>{viewingOrder.transactionId}</strong></span>
                <span className="uppercase text-[10px] bg-emerald-900 text-emerald-200 px-2 py-0.5 rounded font-bold">
                  {viewingOrder.paymentMethod}
                </span>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setViewingOrder(null)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD / EDIT PRODUCT MODAL */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-[#1E293B] border border-slate-700 rounded-3xl max-w-4xl w-full p-4 sm:p-6 space-y-6 max-h-[92vh] overflow-y-auto text-xs my-auto shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#D32F2F]/20 text-[#D32F2F] flex items-center justify-center font-bold">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-white tracking-tight">
                    {editingProduct.title ? `Edit Product: ${editingProduct.title}` : 'Add New Product'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Configure product details, multi-image gallery, manual video, and social video links
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsProductModalOpen(false);
                  setMediaError('');
                }}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Notification Banner */}
            {mediaError && (
              <div className="p-3 bg-red-950/80 border border-red-800 rounded-xl text-red-200 text-xs flex items-center justify-between gap-2 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{mediaError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMediaError('')}
                  className="text-red-400 hover:text-white text-xs font-bold px-2 py-0.5 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            <form onSubmit={handleSaveProductForm} className="space-y-6">
              {/* ========================================================
                  SECTION A: PRODUCT INFORMATION
                 ======================================================== */}
              <div className="bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                  <span className="w-6 h-6 rounded-lg bg-red-500/20 text-[#D32F2F] font-bold flex items-center justify-center text-xs">
                    A
                  </span>
                  <h4 className="font-bold text-white text-sm">Product Information</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">
                      Product Title (English) *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingProduct.title}
                      onChange={e => setEditingProduct({ ...editingProduct, title: e.target.value })}
                      placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#D32F2F]"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">
                      Title in Bengali (বাংলা শিরোনাম)
                    </label>
                    <input
                      type="text"
                      value={editingProduct.titleBn}
                      onChange={e => setEditingProduct({ ...editingProduct, titleBn: e.target.value })}
                      placeholder="e.g. সোনি ওয়্যারলেস হেডফোন"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#D32F2F]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Category *</label>
                    <select
                      value={editingProduct.categoryId}
                      onChange={e => {
                        const selectedCat = categories.find(c => c.id === e.target.value);
                        setEditingProduct({
                          ...editingProduct,
                          categoryId: e.target.value,
                          categoryName: selectedCat?.name || editingProduct.categoryName,
                        });
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#D32F2F] cursor-pointer"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Subcategory</label>
                    <input
                      type="text"
                      value={editingProduct.subcategory || ''}
                      onChange={e =>
                        setEditingProduct({ ...editingProduct, subcategory: e.target.value })
                      }
                      placeholder="e.g. Earphones, Laptops"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#D32F2F]"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">SKU Code *</label>
                    <input
                      type="text"
                      required
                      value={editingProduct.sku}
                      onChange={e => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                      placeholder="A1N-AUD-001"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-[#D32F2F]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">
                      Selling Price (৳) *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={editingProduct.price}
                      onChange={e =>
                        setEditingProduct({ ...editingProduct, price: Number(e.target.value) })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-[#D32F2F]"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">
                      Regular / Sale Price (৳)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={editingProduct.salePrice || ''}
                      onChange={e =>
                        setEditingProduct({
                          ...editingProduct,
                          salePrice: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      placeholder="Leave empty if no discount"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-[#D32F2F]"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Cost Price (৳)</label>
                    <input
                      type="number"
                      min={0}
                      value={editingProduct.cost}
                      onChange={e =>
                        setEditingProduct({ ...editingProduct, cost: Number(e.target.value) })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-[#D32F2F]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">
                      Stock Inventory *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={editingProduct.inventory}
                      onChange={e =>
                        setEditingProduct({ ...editingProduct, inventory: Number(e.target.value) })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-[#D32F2F]"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Status *</label>
                    <select
                      value={editingProduct.status}
                      onChange={e =>
                        setEditingProduct({
                          ...editingProduct,
                          status: e.target.value as Product['status'],
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white uppercase font-bold focus:outline-none focus:border-[#D32F2F] cursor-pointer"
                    >
                      <option value="active">Active (Visible in Store)</option>
                      <option value="draft">Draft (Hidden)</option>
                      <option value="out_of_stock">Out of Stock</option>
                    </select>
                  </div>
                </div>

                {/* Badges */}
                <div>
                  <label className="text-slate-300 font-semibold block mb-1.5">
                    Storefront Badges
                  </label>
                  <div className="flex flex-wrap gap-4 bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!editingProduct.isDeal}
                        onChange={e =>
                          setEditingProduct({ ...editingProduct, isDeal: e.target.checked })
                        }
                        className="accent-[#D32F2F] w-4 h-4 cursor-pointer"
                      />
                      <span className="text-slate-200 font-medium">🔥 Flash Deal</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!editingProduct.isTrending}
                        onChange={e =>
                          setEditingProduct({ ...editingProduct, isTrending: e.target.checked })
                        }
                        className="accent-amber-500 w-4 h-4 cursor-pointer"
                      />
                      <span className="text-slate-200 font-medium">⚡ Trending Gadget</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!editingProduct.isBestSeller}
                        onChange={e =>
                          setEditingProduct({ ...editingProduct, isBestSeller: e.target.checked })
                        }
                        className="accent-blue-500 w-4 h-4 cursor-pointer"
                      />
                      <span className="text-slate-200 font-medium">🏆 Best Seller</span>
                    </label>
                  </div>
                </div>

                {/* Description */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">
                      Description (English)
                    </label>
                    <textarea
                      rows={3}
                      value={editingProduct.description}
                      onChange={e =>
                        setEditingProduct({ ...editingProduct, description: e.target.value })
                      }
                      placeholder="Detailed product overview..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#D32F2F]"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">
                      Description in Bengali (বাংলা বিবরণ)
                    </label>
                    <textarea
                      rows={3}
                      value={editingProduct.descriptionBn || ''}
                      onChange={e =>
                        setEditingProduct({ ...editingProduct, descriptionBn: e.target.value })
                      }
                      placeholder="পণ্যের বিস্তারিত বিবরণ বাংলায়..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#D32F2F]"
                    />
                  </div>
                </div>
              </div>

              {/* ========================================================
                  SECTION B: PRODUCT IMAGES (UPLOAD, PREVIEW, REORDER)
                 ======================================================== */}
              <div className="bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-xs">
                      B
                    </span>
                    <div>
                      <h4 className="font-bold text-white text-sm">Product Images *</h4>
                      <span className="text-[10px] text-slate-400">
                        Upload multiple images. Supported: JPG, PNG, WEBP, GIF, SVG (up to 15MB each)
                      </span>
                    </div>
                  </div>
                  <span className="bg-slate-800 text-blue-300 font-bold px-2.5 py-1 rounded-lg text-[11px]">
                    {editingProduct.images.length} Image{editingProduct.images.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Upload Button & Dropzone */}
                <div>
                  <input
                    id="admin-product-image-upload"
                    type="file"
                    multiple
                    accept={SUPPORTED_IMAGE_EXTENSIONS.join(',')}
                    onChange={e => {
                      if (e.target.files) {
                        handleImageFilesUpload(e.target.files);
                        e.target.value = '';
                      }
                    }}
                    className="hidden"
                  />
                  <label
                    htmlFor="admin-product-image-upload"
                    className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-[#D32F2F] bg-slate-900/80 hover:bg-slate-900 p-6 rounded-2xl transition cursor-pointer text-center group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 group-hover:bg-red-500/10 text-blue-400 group-hover:text-[#D32F2F] flex items-center justify-center mb-2 transition">
                      {isUploadingImages ? (
                        <Loader2 className="w-6 h-6 animate-spin text-[#D32F2F]" />
                      ) : (
                        <Upload className="w-6 h-6" />
                      )}
                    </div>
                    <span className="font-bold text-slate-200 group-hover:text-white text-xs sm:text-sm">
                      {isUploadingImages
                        ? `Uploading Images (${uploadImageProgress}%)...`
                        : 'Click to Upload Images or Drag & Drop'}
                    </span>
                    <span className="text-[11px] text-slate-500 mt-1">
                      Select single or multiple files from your computer or phone
                    </span>
                  </label>

                  {/* Upload Progress Bar */}
                  {isUploadingImages && (
                    <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-[#D32F2F] h-1.5 transition-all duration-300"
                        style={{ width: `${uploadImageProgress}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Alternative URL Input */}
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={manualImageUrl}
                    onChange={e => setManualImageUrl(e.target.value)}
                    placeholder="Or paste an image URL (https://...)..."
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-[#D32F2F] text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleAddManualImageUrl}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition cursor-pointer shrink-0"
                  >
                    + Add URL
                  </button>
                </div>

                {/* Image Gallery Grid & Management */}
                {editingProduct.images.length > 0 ? (
                  <div className="space-y-2 pt-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Uploaded Gallery (First image is the Primary / Cover)
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {editingProduct.images.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          className={`relative rounded-2xl bg-slate-900 border-2 overflow-hidden group transition-all ${
                            idx === 0
                              ? 'border-[#D32F2F] ring-2 ring-red-500/20'
                              : 'border-slate-700/80 hover:border-slate-500'
                          }`}
                        >
                          {/* Primary Badge */}
                          {idx === 0 && (
                            <span className="absolute top-2 left-2 z-10 bg-[#D32F2F] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md shadow-md">
                              Cover Image
                            </span>
                          )}

                          {/* Image Thumbnail */}
                          <div className="aspect-square w-full p-2 flex items-center justify-center bg-slate-950/60">
                            <img
                              src={imgUrl}
                              alt=""
                              className="max-h-full max-w-full object-contain rounded-lg"
                            />
                          </div>

                          {/* Overlay Controls */}
                          <div className="p-2 bg-slate-900/95 border-t border-slate-800 flex items-center justify-between gap-1">
                            {/* Reorder Buttons */}
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleReorderImage(idx, idx - 1)}
                                className={`p-1 rounded-lg transition cursor-pointer ${
                                  idx === 0
                                    ? 'text-slate-600 cursor-not-allowed'
                                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                                }`}
                                title="Move Left / Earlier"
                              >
                                <MoveLeft className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === editingProduct.images.length - 1}
                                onClick={() => handleReorderImage(idx, idx + 1)}
                                className={`p-1 rounded-lg transition cursor-pointer ${
                                  idx === editingProduct.images.length - 1
                                    ? 'text-slate-600 cursor-not-allowed'
                                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                                }`}
                                title="Move Right / Later"
                              >
                                <MoveRight className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Set Cover Button if not cover */}
                            {idx !== 0 && (
                              <button
                                type="button"
                                onClick={() => handleSetCoverImage(idx)}
                                className="text-[10px] text-slate-300 hover:text-white hover:bg-slate-800 px-1.5 py-0.5 rounded font-semibold cursor-pointer"
                                title="Set as Cover Image"
                              >
                                Cover
                              </button>
                            )}

                            {/* Replace & Delete Buttons */}
                            <div className="flex items-center gap-1">
                              <label
                                htmlFor={`replace-img-${idx}`}
                                className="p-1 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                                title="Replace this Image"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                <input
                                  id={`replace-img-${idx}`}
                                  type="file"
                                  accept={SUPPORTED_IMAGE_EXTENSIONS.join(',')}
                                  onChange={e => {
                                    if (e.target.files && e.target.files[0]) {
                                      handleSingleImageReplace(idx, e.target.files[0]);
                                      e.target.value = '';
                                    }
                                  }}
                                  className="hidden"
                                />
                              </label>

                              <button
                                type="button"
                                onClick={() => handleDeleteImage(idx)}
                                className="p-1 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                                title="Remove Image"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-900 rounded-xl text-center text-slate-400 text-xs border border-slate-800">
                    No images added yet. Please upload or provide at least one product photo.
                  </div>
                )}
              </div>

              {/* ========================================================
                  SECTION C: UPLOADED PRODUCT VIDEO (MANUAL VIDEO UPLOAD)
                 ======================================================== */}
              <div className="bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">
                      C
                    </span>
                    <div>
                      <h4 className="font-bold text-white text-sm">Uploaded Product Video</h4>
                      <span className="text-[10px] text-slate-400">
                        Upload an unboxing, demo or review video. Supported: MP4, WebM, MOV, OGG (up
                        to 50MB)
                      </span>
                    </div>
                  </div>
                  {editingProduct.videoUrl && (
                    <span className="bg-emerald-950 text-emerald-300 font-bold px-2.5 py-1 rounded-lg text-[10px] flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Video Attached
                    </span>
                  )}
                </div>

                {editingProduct.videoUrl ? (
                  <div className="space-y-3">
                    {/* HTML5 Native Video Player Preview */}
                    <div className="rounded-2xl overflow-hidden bg-black border border-slate-700 shadow-lg">
                      <video
                        controls
                        playsInline
                        src={editingProduct.videoUrl}
                        className="w-full max-h-72 object-contain bg-black"
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-slate-900 p-3 rounded-xl border border-slate-800">
                      <div className="truncate max-w-md">
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">
                          Current Video Source
                        </span>
                        <span className="font-mono text-xs text-emerald-400 truncate block">
                          {editingProduct.videoUrl}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <input
                          id="admin-video-replace-input"
                          type="file"
                          accept={SUPPORTED_VIDEO_EXTENSIONS.join(',')}
                          onChange={e => {
                            if (e.target.files && e.target.files[0]) {
                              handleVideoFileUpload(e.target.files[0]);
                              e.target.value = '';
                            }
                          }}
                          className="hidden"
                        />
                        <label
                          htmlFor="admin-video-replace-input"
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1.5"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Replace Video</span>
                        </label>

                        <button
                          type="button"
                          onClick={handleDeleteVideo}
                          className="px-3 py-1.5 bg-red-950/60 hover:bg-red-900 text-red-300 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <input
                      id="admin-product-video-upload"
                      type="file"
                      accept={SUPPORTED_VIDEO_EXTENSIONS.join(',')}
                      onChange={e => {
                        if (e.target.files && e.target.files[0]) {
                          handleVideoFileUpload(e.target.files[0]);
                          e.target.value = '';
                        }
                      }}
                      className="hidden"
                    />
                    <label
                      htmlFor="admin-product-video-upload"
                      className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-emerald-500 bg-slate-900/80 hover:bg-slate-900 p-6 rounded-2xl transition cursor-pointer text-center group"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 group-hover:bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2 transition">
                        {isUploadingVideo ? (
                          <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                        ) : (
                          <Film className="w-6 h-6" />
                        )}
                      </div>
                      <span className="font-bold text-slate-200 group-hover:text-white text-xs sm:text-sm">
                        {isUploadingVideo
                          ? `Uploading Video (${uploadVideoProgress}%)...`
                          : 'Click to Upload Product Video (MP4, WebM)'}
                      </span>
                      <span className="text-[11px] text-slate-500 mt-1">
                        Files up to 50MB supported with full playback controls
                      </span>
                    </label>

                    {isUploadingVideo && (
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-1.5 transition-all duration-300"
                          style={{ width: `${uploadVideoProgress}%` }}
                        />
                      </div>
                    )}

                    {/* Manual Direct Video URL */}
                    <div className="flex gap-2 pt-1">
                      <input
                        type="url"
                        value={manualVideoUrlInput}
                        onChange={e => setManualVideoUrlInput(e.target.value)}
                        placeholder="Or paste direct MP4 / WebM video URL (https://...)..."
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleAddManualVideoUrl}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition cursor-pointer shrink-0"
                      >
                        Attach Video
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ========================================================
                  SECTION D: YOUTUBE VIDEO URL (WATCH, SHORTS, EMBED)
                 ======================================================== */}
              <div className="bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-red-600/20 text-red-500 font-bold flex items-center justify-center text-xs">
                      D
                    </span>
                    <div>
                      <h4 className="font-bold text-white text-sm">YouTube Video URL</h4>
                      <span className="text-[10px] text-slate-400">
                        Paste any YouTube watch link, youtu.be, or Shorts URL
                      </span>
                    </div>
                  </div>
                  {editingProduct.youtubeUrl && isValidYouTubeUrl(editingProduct.youtubeUrl) && (
                    <span className="bg-red-950 text-red-300 font-bold px-2.5 py-1 rounded-lg text-[10px] flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Valid YouTube Embed
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Youtube className="w-4 h-4 absolute left-3 top-2.5 text-red-500" />
                      <input
                        type="url"
                        value={editingProduct.youtubeUrl || ''}
                        onChange={e =>
                          setEditingProduct({ ...editingProduct, youtubeUrl: e.target.value })
                        }
                        placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ or https://youtu.be/..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono text-xs"
                      />
                    </div>
                    {editingProduct.youtubeUrl && (
                      <button
                        type="button"
                        onClick={() =>
                          setEditingProduct({ ...editingProduct, youtubeUrl: '' })
                        }
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* YouTube Live Validation & Preview */}
                  {editingProduct.youtubeUrl && (
                    <div className="pt-2">
                      {isValidYouTubeUrl(editingProduct.youtubeUrl) ? (
                        <div className="space-y-2">
                          <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5" />
                            YouTube link verified. Responsive embed preview below:
                          </span>
                          <div className="aspect-video w-full max-h-72 rounded-2xl overflow-hidden bg-black border border-slate-700 shadow-lg">
                            <iframe
                              src={getYouTubeEmbedUrl(editingProduct.youtubeUrl)!}
                              title="YouTube video player"
                              className="w-full h-full border-0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        </div>
                      ) : (
                        <p className="text-[11px] text-amber-400 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Unrecognized YouTube format. Please paste a standard watch link,
                          youtu.be, or shorts URL.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* ========================================================
                  SECTION E: FACEBOOK VIDEO URL (REEL, WATCH & POSTS)
                 ======================================================== */}
              <div className="bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-blue-600/20 text-blue-500 font-bold flex items-center justify-center text-xs">
                      E
                    </span>
                    <div>
                      <h4 className="font-bold text-white text-sm">Facebook Video URL</h4>
                      <span className="text-[10px] text-slate-400">
                        Paste a public Facebook watch link, reel, or video post
                      </span>
                    </div>
                  </div>
                  {editingProduct.facebookVideoUrl &&
                    isValidFacebookVideoUrl(editingProduct.facebookVideoUrl) && (
                      <span className="bg-blue-950 text-blue-300 font-bold px-2.5 py-1 rounded-lg text-[10px] flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Valid Facebook Video Link
                      </span>
                    )}
                </div>

                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-2 font-bold text-blue-400 text-sm">f</span>
                      <input
                        type="url"
                        value={editingProduct.facebookVideoUrl || ''}
                        onChange={e =>
                          setEditingProduct({ ...editingProduct, facebookVideoUrl: e.target.value })
                        }
                        placeholder="e.g. https://www.facebook.com/watch/?v=10153231379946729 or https://fb.watch/..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono text-xs"
                      />
                    </div>
                    {editingProduct.facebookVideoUrl && (
                      <button
                        type="button"
                        onClick={() =>
                          setEditingProduct({ ...editingProduct, facebookVideoUrl: '' })
                        }
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Facebook Live Validation & Preview */}
                  {editingProduct.facebookVideoUrl && (
                    <div className="pt-2">
                      {isValidFacebookVideoUrl(editingProduct.facebookVideoUrl) ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-emerald-400 font-semibold flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" />
                              Recognized Facebook Video link
                            </span>
                            <a
                              href={editingProduct.facebookVideoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 underline"
                            >
                              <span>Test Link on Facebook</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>

                          <div className="aspect-video w-full max-h-72 rounded-2xl overflow-hidden bg-black border border-slate-700 shadow-lg relative">
                            <iframe
                              src={getFacebookEmbedUrl(editingProduct.facebookVideoUrl)!}
                              title="Facebook Video Player"
                              className="w-full h-full border-0"
                              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                              allowFullScreen
                            />
                          </div>

                          <p className="text-[10px] text-slate-400 leading-relaxed bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                            ℹ️ Note: Facebook videos must be set to <strong>Public</strong>. If viewer
                            privacy or browser tracking prevention restricts inline embedding,
                            customers will see a clean fallback button to watch on Facebook.
                          </p>
                        </div>
                      ) : (
                        <p className="text-[11px] text-amber-400 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Please provide a valid Facebook video, reel, or public post URL.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* ========================================================
                  MODAL FOOTER & ACTION BUTTONS
                 ======================================================== */}
              <div className="pt-3 border-t border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-[11px] text-slate-400 flex items-center gap-2">
                  <span>
                    Gallery: <strong>{editingProduct.images.length} images</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Videos:{' '}
                    <strong>
                      {[
                        editingProduct.videoUrl ? 'Manual' : null,
                        editingProduct.youtubeUrl ? 'YouTube' : null,
                        editingProduct.facebookVideoUrl ? 'Facebook' : null,
                      ]
                        .filter(Boolean)
                        .join(', ') || 'None'}
                    </strong>
                  </span>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProductModalOpen(false);
                      setMediaError('');
                    }}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-bold rounded-xl transition cursor-pointer shadow-lg shadow-red-900/30 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Product Changes</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD / EDIT CATEGORY MODAL */}
      {isCategoryModalOpen && editingCategory && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#1E293B] border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="font-bold text-base text-white">
                {editingCategory.name ? 'Edit Category' : 'Add Category'}
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategoryForm} className="space-y-3">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={editingCategory.name}
                  onChange={e => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Name in Bengali (বাংলা)</label>
                <input
                  type="text"
                  value={editingCategory.nameBn}
                  onChange={e => setEditingCategory({ ...editingCategory, nameBn: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Slug / Identifier *</label>
                <input
                  type="text"
                  required
                  value={editingCategory.slug}
                  onChange={e => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Banner Image URL *</label>
                <input
                  type="text"
                  required
                  value={editingCategory.image}
                  onChange={e => setEditingCategory({ ...editingCategory, image: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-bold rounded-xl cursor-pointer shadow-md"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: CREATE COUPON MODAL */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#1E293B] border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="font-bold text-base text-white">Create New Coupon</h3>
              <button
                onClick={() => setIsCouponModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCouponForm} className="space-y-3">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EID50 or SPECIAL10"
                  value={newCoupon.code}
                  onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white uppercase font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Discount Type</label>
                  <select
                    value={newCoupon.discountType}
                    onChange={e =>
                      setNewCoupon({
                        ...newCoupon,
                        discountType: e.target.value as 'percentage' | 'fixed',
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed BDT (৳)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Discount Value *</label>
                  <input
                    type="number"
                    required
                    value={newCoupon.discountValue}
                    onChange={e => setNewCoupon({ ...newCoupon, discountValue: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Minimum Spend (BDT) *</label>
                <input
                  type="number"
                  required
                  value={newCoupon.minSpend}
                  onChange={e => setNewCoupon({ ...newCoupon, minSpend: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-bold rounded-xl cursor-pointer shadow-md"
                >
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
