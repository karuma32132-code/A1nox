import React, { createContext, useContext, useState, useCallback } from 'react';
import { ToastItem, ToastType, ToastOptions } from '../types/toast';

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (type: ToastType, message: string, options?: ToastOptions) => string;
  dismissToast: (id: string) => void;
  clearToasts: () => void;
  toast: {
    success: (message: string, options?: ToastOptions) => string;
    info: (message: string, options?: ToastOptions) => string;
    warning: (message: string, options?: ToastOptions) => string;
    error: (message: string, options?: ToastOptions) => string;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const showToast = useCallback(
    (type: ToastType, message: string, options?: ToastOptions): string => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const duration = options?.duration ?? 4000;

      const newToast: ToastItem = {
        id,
        type,
        message,
        title: options?.title,
        image: options?.image,
        duration,
        action: options?.action,
        createdAt: Date.now(),
      };

      setToasts(prev => [newToast, ...prev].slice(0, 5)); // Keep max 5 visible

      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }

      return id;
    },
    [dismissToast]
  );

  const toast = {
    success: useCallback(
      (message: string, options?: ToastOptions) => showToast('success', message, options),
      [showToast]
    ),
    info: useCallback(
      (message: string, options?: ToastOptions) => showToast('info', message, options),
      [showToast]
    ),
    warning: useCallback(
      (message: string, options?: ToastOptions) => showToast('warning', message, options),
      [showToast]
    ),
    error: useCallback(
      (message: string, options?: ToastOptions) => showToast('error', message, options),
      [showToast]
    ),
  };

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        dismissToast,
        clearToasts,
        toast,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
