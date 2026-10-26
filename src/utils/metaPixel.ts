/**
 * Meta Pixel & Conversions API (CAPI) Integration Engine
 * Supports client-side fbq event tracking and server-side CAPI event deduplication via event_id
 */

export interface MetaEventData {
  event_name: 'PageView' | 'ViewContent' | 'Search' | 'AddToCart' | 'InitiateCheckout' | 'AddPaymentInfo' | 'Purchase' | 'Lead';
  event_id: string;
  event_time: number;
  custom_data?: {
    content_name?: string;
    content_category?: string;
    content_ids?: string[];
    content_type?: string;
    value?: number;
    currency?: string;
    num_items?: number;
    search_string?: string;
    order_id?: string;
    payment_method?: string;
  };
  user_data?: {
    client_ip_address?: string;
    client_user_agent?: string;
    phone_hash?: string;
    email_hash?: string;
  };
}

export interface PixelDiagnosticLog {
  id: string;
  timestamp: string;
  eventName: string;
  eventId: string;
  status: 'sent' | 'blocked_no_id' | 'test_mode';
  payload: any;
}

// In-memory diagnostic logs for admin panel inspection
let diagnosticLogs: PixelDiagnosticLog[] = [];
let initializedPixelId: string | null = null;

export function getDiagnosticLogs(): PixelDiagnosticLog[] {
  return [...diagnosticLogs];
}

export function clearDiagnosticLogs(): void {
  diagnosticLogs = [];
}

/**
 * Initialize Meta Pixel script in document head
 */
export function initMetaPixel(pixelId: string, enabled: boolean): void {
  if (!enabled || !pixelId || typeof window === 'undefined') {
    return;
  }

  if (initializedPixelId === pixelId) {
    return; // Already initialized with this ID
  }

  initializedPixelId = pixelId;

  /* eslint-disable */
  (function(f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
    if (f.fbq) return;
    n = f.fbq = function() {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    if (s && s.parentNode) {
      s.parentNode.insertBefore(t, s);
    }
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */

  if ((window as any).fbq) {
    (window as any).fbq('init', pixelId);
    (window as any).fbq('track', 'PageView');
  }

  logDiagnostic('PageView', 'init', 'sent', { pixelId });
}

/**
 * Generate a unique event_id for deduplication between Pixel & Conversions API
 */
export function generateEventId(prefix = 'evt'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function logDiagnostic(
  eventName: string,
  eventId: string,
  status: 'sent' | 'blocked_no_id' | 'test_mode',
  payload: any
) {
  const log: PixelDiagnosticLog = {
    id: Math.random().toString(36).substring(2, 9),
    timestamp: new Date().toLocaleTimeString(),
    eventName,
    eventId,
    status,
    payload,
  };
  diagnosticLogs.unshift(log);
  if (diagnosticLogs.length > 50) {
    diagnosticLogs.pop();
  }
}

/**
 * Core event dispatcher
 */
export function trackMetaEvent(
  pixelId: string,
  enabled: boolean,
  eventName: MetaEventData['event_name'],
  customData?: MetaEventData['custom_data'],
  customEventId?: string
): string {
  const eventId = customEventId || generateEventId(eventName.toLowerCase());

  if (!enabled || !pixelId) {
    logDiagnostic(eventName, eventId, 'blocked_no_id', {
      reason: !pixelId ? 'No Pixel ID configured' : 'Pixel disabled in settings',
      data: customData,
    });
    return eventId;
  }

  // Client-side fbq event tracking
  if (typeof window !== 'undefined' && (window as any).fbq) {
    try {
      (window as any).fbq('track', eventName, customData, { eventID: eventId });
      logDiagnostic(eventName, eventId, 'sent', customData);
    } catch (e) {
      console.warn('Meta Pixel track warning:', e);
    }
  } else {
    logDiagnostic(eventName, eventId, 'test_mode', {
      note: 'fbq queued or simulated in test mode',
      data: customData,
    });
  }

  return eventId;
}

// Convenience event helpers:
export const trackPageView = (pixelId: string, enabled: boolean) =>
  trackMetaEvent(pixelId, enabled, 'PageView');

export const trackViewContent = (
  pixelId: string,
  enabled: boolean,
  product: { id: string; title: string; price: number; categoryName?: string }
) => {
  return trackMetaEvent(pixelId, enabled, 'ViewContent', {
    content_ids: [product.id],
    content_name: product.title,
    content_type: 'product',
    content_category: product.categoryName || 'General',
    value: product.price,
    currency: 'BDT',
  });
};

export const trackAddToCart = (
  pixelId: string,
  enabled: boolean,
  product: { id: string; title: string; price: number },
  quantity = 1
) => {
  return trackMetaEvent(pixelId, enabled, 'AddToCart', {
    content_ids: [product.id],
    content_name: product.title,
    content_type: 'product',
    value: product.price * quantity,
    currency: 'BDT',
    num_items: quantity,
  });
};

export const trackInitiateCheckout = (
  pixelId: string,
  enabled: boolean,
  cartItems: { productId: string; price: number; quantity: number }[],
  total: number
) => {
  return trackMetaEvent(pixelId, enabled, 'InitiateCheckout', {
    content_ids: cartItems.map(item => item.productId),
    content_type: 'product',
    num_items: cartItems.reduce((acc, item) => acc + item.quantity, 0),
    value: total,
    currency: 'BDT',
  });
};

export const trackPurchase = (
  pixelId: string,
  enabled: boolean,
  order: {
    orderNumber: string;
    total: number;
    items: { productId: string; price: number; quantity: number }[];
    paymentMethod: string;
  }
) => {
  return trackMetaEvent(pixelId, enabled, 'Purchase', {
    order_id: order.orderNumber,
    content_ids: order.items.map(item => item.productId),
    content_type: 'product',
    num_items: order.items.reduce((acc, item) => acc + item.quantity, 0),
    value: order.total,
    currency: 'BDT',
    payment_method: order.paymentMethod,
  });
};
