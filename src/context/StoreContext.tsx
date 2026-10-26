import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  Category,
  CartItem,
  Order,
  StoreSettings,
  Coupon,
  Language,
  DeliveryZone,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_SETTINGS,
  INITIAL_COUPONS,
} from '../data/initialData';
import {
  getProductsFromDB,
  saveProductToDB,
  deleteProductFromDB,
  getCategoriesFromDB,
  saveCategoryToDB,
  deleteCategoryFromDB,
  getOrdersFromDB,
  createOrderInDB,
  updateOrderStatusInDB,
  deleteOrderFromDB,
  getSettingsFromDB,
  saveSettingsToDB,
  getCouponsFromDB,
  saveCouponToDB,
  deleteCouponFromDB,
  getWishlistFromDB,
  saveWishlistToDB,
  getAllReviewsFromDB,
  deleteReviewFromDB,
} from '../firebase/firestore';
import { auth, loginWithGoogle, logoutUser, testConnection } from '../firebase/config';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  initMetaPixel,
  trackPageView,
  trackAddToCart as metaTrackAddToCart,
  trackInitiateCheckout as metaTrackInitiateCheckout,
  trackPurchase as metaTrackPurchase,
  trackViewContent as metaTrackViewContent,
} from '../utils/metaPixel';
import { translations } from '../utils/translations';
import { useToast } from './ToastContext';
import { AUTHORIZED_ADMIN_CONFIG, isAuthorizedAdmin } from '../config/adminSecurity';

interface StoreContextType {
  products: Product[];
  categories: Category[];
  cart: CartItem[];
  wishlist: string[];
  orders: Order[];
  settings: StoreSettings;
  coupons: Coupon[];
  language: Language;
  deliveryZone: DeliveryZone;
  appliedCoupon: Coupon | null;
  activeNavTab: string;
  selectedCategory: string | null;
  searchQuery: string;
  selectedProduct: Product | null;
  isCartOpen: boolean;
  isCheckoutOpen: boolean;
  isTrackingOpen: boolean;
  isAdminOpen: boolean;
  currentUser: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  t: typeof translations['en'];
  toast: ReturnType<typeof useToast>['toast'];

  // Calculations
  cartSubtotal: number;
  deliveryCharge: number;
  discountAmount: number;
  cartTotal: number;
  isFreeDeliveryQualified: boolean;
  amountNeededForFreeDelivery: number;

  // Actions
  setLanguage: (lang: Language) => void;
  setDeliveryZone: (zone: DeliveryZone) => void;
  setActiveNavTab: (tab: string) => void;
  setSelectedCategory: (categoryId: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedProduct: (product: Product | null) => void;
  setIsCartOpen: (open: boolean) => void;
  setIsCheckoutOpen: (open: boolean) => void;
  setIsTrackingOpen: (open: boolean) => void;
  setIsAdminOpen: (open: boolean) => void;
  quickBuyProduct: { product: Product; quantity: number; color?: string } | null;
  openQuickBuy: (product: Product, quantity?: number, color?: string) => void;
  closeQuickBuy: () => void;

  addToCart: (product: Product, quantity?: number, color?: string) => void;
  updateCartQuantity: (productId: string, quantity: number, color?: string) => void;
  removeFromCart: (productId: string, color?: string) => void;
  clearCart: () => void;

  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;

  submitOrder: (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>, clearCartAfter?: boolean) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: Order['status'], paymentStatus?: Order['paymentStatus']) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  seedSampleOrders: () => void;
  refreshOrders: () => Promise<void>;

  saveProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  saveCategory: (category: Category) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
  updateSettings: (newSettings: StoreSettings) => Promise<void>;
  saveCoupon: (coupon: Coupon) => Promise<void>;
  deleteCoupon: (code: string) => Promise<void>;

  handleGoogleLogin: () => Promise<void>;
  handleLogout: () => Promise<void>;
  getAdminToken: () => Promise<string | undefined>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('a1nox_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('a1nox_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem('a1nox_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem('a1nox_coupons');
    return saved ? JSON.parse(saved) : INITIAL_COUPONS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('a1nox_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('a1nox_cart');
      if (!saved) return [];
      const parsed: CartItem[] = JSON.parse(saved);
      // Auto-deduplicate any legacy duplicates in localStorage
      const mergedMap = new Map<string, CartItem>();
      parsed.forEach(item => {
        const key = `${item.product.id}__${item.selectedColor || ''}`;
        if (mergedMap.has(key)) {
          mergedMap.get(key)!.quantity += item.quantity;
        } else {
          mergedMap.set(key, { ...item });
        }
      });
      return Array.from(mergedMap.values());
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('a1nox_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('a1nox_lang') as Language;
    return saved === 'bn' ? 'bn' : 'en';
  });

  const [deliveryZone, setDeliveryZone] = useState<DeliveryZone>('inside_dhaka');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  // Navigation & View States
  const [activeNavTab, setActiveNavTab] = useState<string>('home');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProductState] = useState<Product | null>(null);

  // Modals & Drawers
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [quickBuyProduct, setQuickBuyProduct] = useState<{
    product: Product;
    quantity: number;
    color?: string;
  } | null>(null);

  const openQuickBuy = (product: Product, quantity = 1, color?: string) => {
    setQuickBuyProduct({
      product,
      quantity,
      color: color || (product.colors && product.colors.length > 0 ? product.colors[0] : undefined),
    });
  };

  const closeQuickBuy = () => {
    setQuickBuyProduct(null);
  };

  // Auth & Admin: STRICT OWNER AUTHORIZATION ONLY
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Admin access rule: strictly restricted to verified owner email
  const isAdmin = Boolean(currentUser && isAuthorizedAdmin(currentUser));

  // Initialize Firebase connection test on boot
  useEffect(() => {
    testConnection();
    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Fetch public data (products and settings) from Firestore on mount
  useEffect(() => {
    async function loadPublicData() {
      setIsLoading(true);
      try {
        const dbProducts = await getProductsFromDB();
        if (dbProducts && dbProducts.length > 0) {
          setProducts(dbProducts);
        }
      } catch (e) {
        console.warn('Could not fetch products from Firestore, using cached/initial dataset:', e);
      }

      try {
        const dbSettings = await getSettingsFromDB();
        if (dbSettings) {
          setSettings(dbSettings);
        }
      } catch (e) {
        console.warn('Could not fetch settings from Firestore:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadPublicData();
  }, []);

  // Fetch admin-only data (orders list) ONLY when the authentic owner admin is signed in
  useEffect(() => {
    async function loadAdminData() {
      if (currentUser && isAuthorizedAdmin(currentUser)) {
        try {
          const dbOrders = await getOrdersFromDB();
          if (dbOrders && dbOrders.length > 0) {
            setOrders(dbOrders);
          }
        } catch (e) {
          console.warn('Could not fetch orders from Firestore:', e);
        }
      } else {
        // Clear protected customer order records when signed out or unauthorized
        setOrders([]);
      }
    }
    loadAdminData();
  }, [currentUser]);

  // Fetch & sync persistent wishlist from Firestore on user authentication
  useEffect(() => {
    async function syncUserWishlist() {
      if (currentUser?.uid) {
        try {
          const cloudWishlist = await getWishlistFromDB(currentUser.uid);
          if (cloudWishlist && Array.isArray(cloudWishlist)) {
            // Merge cloud wishlist with local items and persist
            setWishlist(prev => {
              const merged = Array.from(new Set([...cloudWishlist, ...prev]));
              localStorage.setItem('a1nox_wishlist', JSON.stringify(merged));
              if (merged.length !== cloudWishlist.length) {
                saveWishlistToDB(currentUser.uid, merged).catch(() => {});
              }
              return merged;
            });
          } else if (wishlist.length > 0) {
            // Initial cloud sync of local items
            saveWishlistToDB(currentUser.uid, wishlist).catch(() => {});
          }
        } catch (e) {
          console.warn('Could not sync wishlist from Firestore:', e);
        }
      }
    }
    syncUserWishlist();
  }, [currentUser?.uid]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('a1nox_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('a1nox_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('a1nox_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('a1nox_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('a1nox_settings', JSON.stringify(settings));
  }, [settings]);

  // Initialize Meta Pixel whenever settings change
  useEffect(() => {
    if (settings.metaPixelId && settings.metaPixelEnabled) {
      initMetaPixel(settings.metaPixelId, settings.metaPixelEnabled);
      trackPageView(settings.metaPixelId, settings.metaPixelEnabled);
    }
  }, [settings.metaPixelId, settings.metaPixelEnabled]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('a1nox_lang', lang);
  };

  const setSelectedProduct = (product: Product | null) => {
    setSelectedProductState(product);
    if (product && settings.metaPixelId && settings.metaPixelEnabled) {
      metaTrackViewContent(settings.metaPixelId, settings.metaPixelEnabled, product);
    }
  };

  // Cart Calculations
  const cartSubtotal = cart.reduce(
    (sum, item) => sum + (item.product.price * item.quantity),
    0
  );

  const isFreeDeliveryQualified = cartSubtotal >= settings.freeDeliveryThreshold;

  const amountNeededForFreeDelivery = isFreeDeliveryQualified
    ? 0
    : settings.freeDeliveryThreshold - cartSubtotal;

  const baseDeliveryCharge =
    deliveryZone === 'inside_dhaka'
      ? settings.insideDhakaDeliveryFee
      : settings.outsideDhakaDeliveryFee;

  const deliveryCharge = isFreeDeliveryQualified || cart.length === 0 ? 0 : baseDeliveryCharge;

  // Discount calculation
  let discountAmount = 0;
  if (appliedCoupon && cartSubtotal >= appliedCoupon.minSpend) {
    if (appliedCoupon.discountType === 'percentage') {
      discountAmount = Math.round((cartSubtotal * appliedCoupon.discountValue) / 100);
    } else {
      discountAmount = appliedCoupon.discountValue;
    }
  }

  const cartTotal = Math.max(0, cartSubtotal + deliveryCharge - discountAmount);

  // Cart operations
  const addToCart = (product: Product, quantity = 1, color?: string) => {
    const targetColor = color !== undefined
      ? color
      : (product.colors && product.colors.length > 0 ? product.colors[0] : undefined);

    setCart(prev => {
      const existingIndex = prev.findIndex(
        item => item.product.id === product.id && item.selectedColor === targetColor
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [...prev, { product, quantity, selectedColor: targetColor }];
      }
    });

    if (settings.metaPixelId && settings.metaPixelEnabled) {
      metaTrackAddToCart(settings.metaPixelId, settings.metaPixelEnabled, product, quantity);
    }

    // Trigger Success Toast with product thumbnail & action
    const productTitle = language === 'bn' ? product.titleBn : product.title;
    toast.success(
      language === 'bn'
        ? `"${productTitle}" সফলভাবে কার্টে যুক্ত হয়েছে!`
        : `"${productTitle}" added to your shopping cart!`,
      {
        title: language === 'bn' ? 'কার্টে যুক্ত হয়েছে' : 'Added to Cart',
        image: product.images[0],
        action: {
          label: language === 'bn' ? 'কার্ট দেখুন' : 'View Cart',
          onClick: () => setIsCartOpen(true),
        },
      }
    );

    setIsCartOpen(true);
  };

  const updateCartQuantity = (productId: string, quantity: number, color?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, color);
      return;
    }
    setCart(prev =>
      prev.map(item => {
        const matches = color !== undefined
          ? item.product.id === productId && item.selectedColor === color
          : item.product.id === productId;
        return matches ? { ...item, quantity } : item;
      })
    );
  };

  const removeFromCart = (productId: string, color?: string) => {
    setCart(prev =>
      prev.filter(item => {
        if (color !== undefined) {
          return !(item.product.id === productId && item.selectedColor === color);
        }
        return item.product.id !== productId;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  // Wishlist operations with dual localStorage and Firestore persistence
  const toggleWishlist = (productId: string) => {
    const product = products.find(p => p.id === productId);
    const productTitle = product
      ? (language === 'bn' ? product.titleBn : product.title)
      : 'Product';

    setWishlist(prev => {
      const isAdding = !prev.includes(productId);
      const updated = isAdding
        ? [...prev, productId]
        : prev.filter(id => id !== productId);
      localStorage.setItem('a1nox_wishlist', JSON.stringify(updated));

      // Persist to Firestore if user has an active identity
      if (currentUser?.uid) {
        saveWishlistToDB(currentUser.uid, updated).catch(e => {
          console.warn('Firestore wishlist write status:', e);
        });
      }

      // Trigger Wishlist Toast Alert
      if (isAdding) {
        toast.success(
          language === 'bn'
            ? `"${productTitle}" আপনার উইশলিস্টে যুক্ত হয়েছে!`
            : `"${productTitle}" added to your wishlist!`,
          {
            title: language === 'bn' ? 'উইশলিস্ট আপডেট' : 'Wishlist Updated',
            image: product?.images?.[0],
            action: {
              label: language === 'bn' ? 'উইশলিস্ট দেখুন' : 'View Wishlist',
              onClick: () => setActiveNavTab('wishlist'),
            },
          }
        );
      } else {
        toast.info(
          language === 'bn'
            ? `"${productTitle}" উইশলিস্ট থেকে সরানো হয়েছে।`
            : `"${productTitle}" removed from your wishlist.`,
          {
            title: language === 'bn' ? 'উইশলিস্ট আপডেট' : 'Wishlist Updated',
          }
        );
      }

      return updated;
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // Coupon operations
  const applyCoupon = (code: string) => {
    const trimmed = code.trim().toUpperCase();
    const found = coupons.find(c => c.code.toUpperCase() === trimmed && c.isActive);
    if (!found) {
      return { success: false, message: 'Invalid or expired coupon code.' };
    }
    if (cartSubtotal < found.minSpend) {
      return {
        success: false,
        message: `This coupon requires a minimum subtotal of ৳${found.minSpend.toLocaleString()}.`,
      };
    }
    setAppliedCoupon(found);
    return {
      success: true,
      message: `Coupon "${found.code}" applied successfully! You saved ৳${found.discountType === 'percentage' ? `${found.discountValue}%` : found.discountValue}.`,
    };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  // Order submission
  const submitOrder = async (
    orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>,
    clearCartAfter = true
  ): Promise<Order> => {
    const orderNumber = `A1N-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const id = orderNumber;
    const now = new Date().toISOString();

    const fullOrder: Order = {
      ...orderData,
      id,
      orderNumber,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await createOrderInDB(fullOrder);
    } catch (e) {
      console.warn('Failed to record order to Firestore, saving locally:', e);
    }

    // Cache latest placed order id & phone for quick tracking in current session
    try {
      localStorage.setItem('a1nox_last_order_id', fullOrder.id);
      localStorage.setItem('a1nox_last_order_phone', fullOrder.customerPhone);
    } catch (_) {}

    setOrders(prev => [fullOrder, ...prev]);

    // Track Meta Purchase event
    if (settings.metaPixelId && settings.metaPixelEnabled) {
      metaTrackPurchase(settings.metaPixelId, settings.metaPixelEnabled, {
        orderNumber: fullOrder.orderNumber,
        total: fullOrder.total,
        items: fullOrder.items,
        paymentMethod: fullOrder.paymentMethod,
      });
    }

    if (clearCartAfter) {
      clearCart();
    }

    // Trigger Order Confirmation Toast Alert
    toast.success(
      language === 'bn'
        ? `অর্ডার #${fullOrder.orderNumber} সফলভাবে গৃহীত হয়েছে! সর্বমোট: ৳${fullOrder.total.toLocaleString()}`
        : `Order #${fullOrder.orderNumber} confirmed successfully! Total: ৳${fullOrder.total.toLocaleString()}`,
      {
        title: language === 'bn' ? 'অর্ডার সফল 🎉' : 'Order Confirmed 🎉',
        duration: 7000,
        action: {
          label: language === 'bn' ? 'ট্র্যাক করুন' : 'Track Order',
          onClick: () => setIsTrackingOpen(true),
        },
      }
    );

    return fullOrder;
  };

  const updateOrderStatus = async (
    orderId: string,
    status: Order['status'],
    paymentStatus?: Order['paymentStatus']
  ) => {
    if (!isAdmin || !currentUser || !isAuthorizedAdmin(currentUser)) {
      toast.error(`Unauthorized: Only the verified store owner (${AUTHORIZED_ADMIN_CONFIG.ownerEmail}) can update order status.`);
      throw new Error('Unauthorized');
    }
    try {
      await updateOrderStatusInDB(orderId, status, paymentStatus);
    } catch (e) {
      console.warn('Failed to update status in DB, updating state:', e);
    }
    setOrders(prev =>
      prev.map(ord =>
        ord.id === orderId
          ? {
              ...ord,
              status,
              ...(paymentStatus ? { paymentStatus } : {}),
              updatedAt: new Date().toISOString(),
            }
          : ord
      )
    );
  };

  // Product management
  const saveProduct = async (product: Product) => {
    if (!isAdmin || !currentUser || !isAuthorizedAdmin(currentUser)) {
      toast.error(`Unauthorized: Only the verified store owner (${AUTHORIZED_ADMIN_CONFIG.ownerEmail}) can modify products.`);
      throw new Error('Unauthorized');
    }
    try {
      await saveProductToDB(product);
    } catch (e) {
      console.warn('Firestore write failed, updating locally:', e);
    }
    setProducts(prev => {
      const idx = prev.findIndex(p => p.id === product.id);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx] = product;
        return copy;
      }
      return [product, ...prev];
    });
  };

  const deleteProduct = async (productId: string) => {
    if (!isAdmin || !currentUser || !isAuthorizedAdmin(currentUser)) {
      toast.error(`Unauthorized: Only the verified store owner (${AUTHORIZED_ADMIN_CONFIG.ownerEmail}) can delete products.`);
      throw new Error('Unauthorized');
    }
    try {
      await deleteProductFromDB(productId);
    } catch (e) {
      console.warn('Firestore delete failed, updating locally:', e);
    }
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  // Settings
  const updateSettings = async (newSettings: StoreSettings) => {
    if (!isAdmin || !currentUser || !isAuthorizedAdmin(currentUser)) {
      toast.error(`Unauthorized: Only the verified store owner (${AUTHORIZED_ADMIN_CONFIG.ownerEmail}) can update settings.`);
      throw new Error('Unauthorized');
    }
    try {
      await saveSettingsToDB(newSettings);
    } catch (e) {
      console.warn('Firestore settings write failed, updating locally:', e);
    }
    setSettings(newSettings);
  };

  // Categories
  const saveCategory = async (category: Category) => {
    if (!isAdmin || !currentUser || !isAuthorizedAdmin(currentUser)) {
      toast.error(`Unauthorized: Only the verified store owner (${AUTHORIZED_ADMIN_CONFIG.ownerEmail}) can modify categories.`);
      throw new Error('Unauthorized');
    }
    try {
      await saveCategoryToDB(category);
    } catch (e) {
      console.warn('Firestore category write failed:', e);
    }
    setCategories(prev => {
      const idx = prev.findIndex(c => c.id === category.id);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx] = category;
        return copy;
      }
      return [...prev, category];
    });
  };

  const deleteCategory = async (categoryId: string) => {
    if (!isAdmin || !currentUser || !isAuthorizedAdmin(currentUser)) {
      toast.error(`Unauthorized: Only the verified store owner (${AUTHORIZED_ADMIN_CONFIG.ownerEmail}) can delete categories.`);
      throw new Error('Unauthorized');
    }
    try {
      await deleteCategoryFromDB(categoryId);
    } catch (e) {
      console.warn('Firestore category delete failed:', e);
    }
    setCategories(prev => prev.filter(c => c.id !== categoryId));
  };

  // Coupons
  const saveCoupon = async (coupon: Coupon) => {
    if (!isAdmin || !currentUser || !isAuthorizedAdmin(currentUser)) {
      toast.error(`Unauthorized: Only the verified store owner (${AUTHORIZED_ADMIN_CONFIG.ownerEmail}) can modify coupons.`);
      throw new Error('Unauthorized');
    }
    try {
      await saveCouponToDB(coupon);
    } catch (e) {
      console.warn('Firestore coupon write failed:', e);
    }
    setCoupons(prev => {
      const idx = prev.findIndex(c => c.code.toUpperCase() === coupon.code.toUpperCase());
      if (idx > -1) {
        const copy = [...prev];
        copy[idx] = coupon;
        return copy;
      }
      return [coupon, ...prev];
    });
  };

  const deleteCoupon = async (code: string) => {
    if (!isAdmin || !currentUser || !isAuthorizedAdmin(currentUser)) {
      toast.error(`Unauthorized: Only the verified store owner (${AUTHORIZED_ADMIN_CONFIG.ownerEmail}) can delete coupons.`);
      throw new Error('Unauthorized');
    }
    try {
      await deleteCouponFromDB(code);
    } catch (e) {
      console.warn('Firestore coupon delete failed:', e);
    }
    setCoupons(prev => prev.filter(c => c.code.toUpperCase() !== code.toUpperCase()));
  };

  // Orders Admin Operations
  const deleteOrder = async (orderId: string) => {
    if (!isAdmin || !currentUser || !isAuthorizedAdmin(currentUser)) {
      toast.error(`Unauthorized: Only the verified store owner (${AUTHORIZED_ADMIN_CONFIG.ownerEmail}) can delete orders.`);
      throw new Error('Unauthorized');
    }
    try {
      await deleteOrderFromDB(orderId);
    } catch (e) {
      console.warn('Firestore delete order failed:', e);
    }
    setOrders(prev => prev.filter(o => o.id !== orderId));
  };

  const refreshOrders = async () => {
    if (!isAdmin || !currentUser || !isAuthorizedAdmin(currentUser)) {
      return;
    }
    try {
      const dbOrders = await getOrdersFromDB();
      if (dbOrders && dbOrders.length > 0) {
        setOrders(dbOrders);
      }
    } catch (e) {
      console.warn('Could not refresh orders from Firestore:', e);
    }
  };

  const seedSampleOrders = () => {
    const sampleOrdersList: Order[] = [
      {
        id: `ord-sample-01`,
        orderNumber: 'A1N-9021',
        customerName: 'Tanvir Ahmed',
        customerPhone: '01712345678',
        customerEmail: 'tanvir@gmail.com',
        deliveryAddress: 'House 42, Road 11, Banani, Dhaka',
        district: 'Dhaka',
        deliveryZone: 'inside_dhaka',
        subtotal: 3998,
        deliveryCharge: 0,
        discount: 200,
        couponCode: 'A1NOX10',
        total: 3798,
        paymentMethod: 'bkash',
        paymentStatus: 'paid',
        transactionId: 'BKH98234190',
        status: 'processing',
        items: [
          {
            productId: products[0]?.id || 'prod-headphone-01',
            productTitle: products[0]?.title || 'Sony WH-1000XM5 Wireless Headphones',
            price: products[0]?.price || 2499,
            quantity: 1,
            image: products[0]?.images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
          },
        ],
        notes: 'Please call before delivery',
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `ord-sample-02`,
        orderNumber: 'A1N-9022',
        customerName: 'Nusrat Jahan',
        customerPhone: '01898765432',
        customerEmail: 'nusrat.jahan@yahoo.com',
        deliveryAddress: 'Flat 4B, Nasirabad Housing Society, Chattogram',
        district: 'Chittagong',
        deliveryZone: 'outside_dhaka',
        subtotal: 1999,
        deliveryCharge: 120,
        discount: 0,
        total: 2119,
        paymentMethod: 'cod',
        paymentStatus: 'pending',
        status: 'confirmed',
        items: [
          {
            productId: products[1]?.id || 'prod-smartwatch-02',
            productTitle: products[1]?.title || 'Apple Watch Series 9 GPS 45mm',
            price: products[1]?.price || 1999,
            quantity: 1,
            image: products[1]?.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
          },
        ],
        createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `ord-sample-03`,
        orderNumber: 'A1N-9023',
        customerName: 'Shakil Hasan',
        customerPhone: '01911223344',
        customerEmail: 'shakil.h@gmail.com',
        deliveryAddress: 'Zindabazar Point, Sylhet',
        district: 'Sylhet',
        deliveryZone: 'outside_dhaka',
        subtotal: 5498,
        deliveryCharge: 0,
        discount: 300,
        couponCode: 'A1NOX10',
        total: 5198,
        paymentMethod: 'nagad',
        paymentStatus: 'paid',
        transactionId: 'NGD4918230',
        status: 'shipped',
        items: [
          {
            productId: products[2]?.id || 'prod-earbuds-03',
            productTitle: products[2]?.title || 'AirPods Pro ANC',
            price: products[2]?.price || 1499,
            quantity: 2,
            image: products[2]?.images[0] || 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
          },
        ],
        createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    setOrders(sampleOrdersList);
    localStorage.setItem('a1nox_orders', JSON.stringify(sampleOrdersList));
  };

  // Secure Google Authentication & Admin Session
  const getAdminToken = async (): Promise<string | undefined> => {
    if (currentUser && isAuthorizedAdmin(currentUser)) {
      return await auth.currentUser?.getIdToken();
    }
    return undefined;
  };

  const handleGoogleLogin = async () => {
    try {
      const res = await loginWithGoogle();
      if (res?.user) {
        if (isAuthorizedAdmin(res.user)) {
          toast.success(`Welcome, Store Owner! Authorized as ${res.user.email}. Admin controls unlocked.`);
        } else {
          toast.info(`Signed in as ${res.user.displayName || res.user.email}. Customer privileges active.`);
        }
      } else if (res?.error) {
        toast.error(res.error);
      }
    } catch (e: any) {
      console.warn('Google sign-in status:', e?.message || e);
      toast.error('Could not complete Google Sign-In.');
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.warn('Logout status:', e);
    }
    setCurrentUser(null);
    setIsAdminOpen(false);
    toast.info('You have been signed out successfully.');
  };

  const t = translations[language];

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        cart,
        wishlist,
        orders,
        settings,
        coupons,
        language,
        deliveryZone,
        appliedCoupon,
        activeNavTab,
        selectedCategory,
        searchQuery,
        selectedProduct,
        isCartOpen,
        isCheckoutOpen,
        isTrackingOpen,
        isAdminOpen,
        currentUser,
        isAdmin,
        isLoading,
        t,
        toast,

        cartSubtotal,
        deliveryCharge,
        discountAmount,
        cartTotal,
        isFreeDeliveryQualified,
        amountNeededForFreeDelivery,

        setLanguage,
        setDeliveryZone,
        setActiveNavTab,
        setSelectedCategory,
        setSearchQuery,
        setSelectedProduct,
        setIsCartOpen,
        setIsCheckoutOpen,
        setIsTrackingOpen,
        setIsAdminOpen,
        quickBuyProduct,
        openQuickBuy,
        closeQuickBuy,

        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,

        toggleWishlist,
        isInWishlist,

        applyCoupon,
        removeCoupon,

        submitOrder,
        updateOrderStatus,
        deleteOrder,
        seedSampleOrders,
        refreshOrders,

        saveProduct,
        deleteProduct,
        saveCategory,
        deleteCategory,
        updateSettings,
        saveCoupon,
        deleteCoupon,

        handleGoogleLogin,
        handleLogout,
        getAdminToken,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
