export type ToastType = 'success' | 'info' | 'warning' | 'error';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  title?: string;
  image?: string;
  duration?: number; // duration in ms, default 4000
  action?: ToastAction;
}

export interface ToastItem extends ToastOptions {
  id: string;
  type: ToastType;
  message: string;
  createdAt: number;
}
