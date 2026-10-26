import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db, auth } from './config';
import { Product, Order, StoreSettings, Category, Coupon } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Products
export async function getProductsFromDB(): Promise<Product[]> {
  const path = 'products';
  try {
    const snap = await getDocs(collection(db, path));
    return snap.docs.map(d => ({ ...(d.data() as Product), id: d.id }));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function saveProductToDB(product: Product): Promise<void> {
  const path = `products/${product.id}`;
  try {
    await setDoc(doc(db, 'products', product.id), product);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteProductFromDB(productId: string): Promise<void> {
  const path = `products/${productId}`;
  try {
    await deleteDoc(doc(db, 'products', productId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// Categories
export async function getCategoriesFromDB(): Promise<Category[]> {
  const path = 'categories';
  try {
    const snap = await getDocs(collection(db, path));
    return snap.docs.map(d => ({ ...(d.data() as Category), id: d.id }));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function saveCategoryToDB(category: Category): Promise<void> {
  const path = `categories/${category.id}`;
  try {
    await setDoc(doc(db, 'categories', category.id), category);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// Orders
export async function createOrderInDB(order: Order): Promise<void> {
  const path = `orders/${order.id}`;
  try {
    const cleanOrder = JSON.parse(JSON.stringify(order));
    await setDoc(doc(db, 'orders', order.id), cleanOrder);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function getOrdersFromDB(): Promise<Order[]> {
  const path = 'orders';
  try {
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ ...(d.data() as Order), id: d.id }));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function updateOrderStatusInDB(orderId: string, status: Order['status'], paymentStatus?: Order['paymentStatus']): Promise<void> {
  const path = `orders/${orderId}`;
  try {
    const updateData: any = {
      status,
      updatedAt: new Date().toISOString(),
    };
    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }
    await updateDoc(doc(db, 'orders', orderId), updateData);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function getOrderByIdFromDB(orderId: string): Promise<Order | null> {
  const path = `orders/${orderId}`;
  try {
    const snap = await getDoc(doc(db, 'orders', orderId));
    if (snap.exists()) {
      return { ...(snap.data() as Order), id: snap.id };
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

export function subscribeToOrderInDB(
  orderId: string,
  onUpdate: (order: Order | null) => void,
  onError?: (error: unknown) => void
): () => void {
  const path = `orders/${orderId}`;
  return onSnapshot(
    doc(db, 'orders', orderId),
    snap => {
      if (snap.exists()) {
        onUpdate({ ...(snap.data() as Order), id: snap.id });
      } else {
        onUpdate(null);
      }
    },
    err => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
}

// Settings
export async function getSettingsFromDB(): Promise<StoreSettings | null> {
  const path = 'settings/general';
  try {
    const snap = await getDoc(doc(db, 'settings', 'general'));
    if (snap.exists()) {
      return snap.data() as StoreSettings;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

export async function saveSettingsToDB(settings: StoreSettings): Promise<void> {
  const path = 'settings/general';
  try {
    await setDoc(doc(db, 'settings', 'general'), settings);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// Coupons
export async function getCouponsFromDB(): Promise<Coupon[]> {
  const path = 'coupons';
  try {
    const snap = await getDocs(collection(db, path));
    return snap.docs.map(d => ({ ...(d.data() as Coupon) }));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function saveCouponToDB(coupon: Coupon): Promise<void> {
  const path = `coupons/${coupon.code}`;
  try {
    await setDoc(doc(db, 'coupons', coupon.code), coupon);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// Wishlists
export async function getWishlistFromDB(userId: string): Promise<string[] | null> {
  const path = `wishlists/${userId}`;
  try {
    const snap = await getDoc(doc(db, 'wishlists', userId));
    if (snap.exists()) {
      const data = snap.data();
      return Array.isArray(data.productIds) ? data.productIds : [];
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

export async function saveWishlistToDB(userId: string, productIds: string[]): Promise<void> {
  const path = `wishlists/${userId}`;
  try {
    await setDoc(doc(db, 'wishlists', userId), {
      userId,
      productIds,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// Delete helpers for Admin
export async function deleteOrderFromDB(orderId: string): Promise<void> {
  const path = `orders/${orderId}`;
  try {
    await deleteDoc(doc(db, 'orders', orderId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function deleteCategoryFromDB(categoryId: string): Promise<void> {
  const path = `categories/${categoryId}`;
  try {
    await deleteDoc(doc(db, 'categories', categoryId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function deleteCouponFromDB(code: string): Promise<void> {
  const path = `coupons/${code}`;
  try {
    await deleteDoc(doc(db, 'coupons', code));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function getAllReviewsFromDB(): Promise<any[]> {
  const path = 'reviews';
  try {
    const snap = await getDocs(collection(db, path));
    return snap.docs.map(d => ({ ...d.data(), id: d.id }));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function deleteReviewFromDB(reviewId: string): Promise<void> {
  const path = `reviews/${reviewId}`;
  try {
    await deleteDoc(doc(db, 'reviews', reviewId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

