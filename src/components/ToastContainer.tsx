import React from 'react';
import { useToast } from '../context/ToastContext';
import { ToastItem, ToastType } from '../types/toast';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
  ArrowRight,
  ShoppingBag,
  Heart,
  PackageCheck,
} from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full pointer-events-none px-3 sm:px-0"
    >
      {toasts.map(toast => (
        <ToastCard key={toast.id} toast={toast} onDismiss={() => dismissToast(toast.id)} />
      ))}
    </div>
  );
};

const ToastCard: React.FC<{ toast: ToastItem; onDismiss: () => void }> = ({ toast, onDismiss }) => {
  const getIconAndColors = (type: ToastType) => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-200/80',
          progressColor: 'bg-emerald-500',
        };
      case 'info':
        return {
          icon: <Info className="w-5 h-5 text-blue-600" />,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200/80',
          progressColor: 'bg-blue-500',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200/80',
          progressColor: 'bg-amber-500',
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-5 h-5 text-rose-600" />,
          bgColor: 'bg-rose-50',
          borderColor: 'border-rose-200/80',
          progressColor: 'bg-rose-500',
        };
    }
  };

  const { icon, bgColor, borderColor, progressColor } = getIconAndColors(toast.type);

  return (
    <div
      className={`pointer-events-auto bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-xl border ${borderColor} flex flex-col gap-2 overflow-hidden relative transition-all duration-300 animate-in slide-in-from-top-3 fade-in`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        {/* Left Visual: Product Thumbnail or Status Icon */}
        {toast.image ? (
          <div className="relative w-11 h-11 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center p-1">
            <img src={toast.image} alt="" className="w-full h-full object-contain" />
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${bgColor} flex items-center justify-center border border-white shadow-xs`}>
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            </div>
          </div>
        ) : (
          <div className={`w-9 h-9 rounded-xl ${bgColor} flex items-center justify-center shrink-0`}>
            {icon}
          </div>
        )}

        {/* Text Content */}
        <div className="flex-1 min-w-0 pr-1">
          {toast.title && (
            <h4 className="text-xs font-black text-gray-900 tracking-tight flex items-center gap-1.5 mb-0.5">
              <span>{toast.title}</span>
            </h4>
          )}
          <p className="text-xs text-gray-600 font-medium leading-snug break-words">
            {toast.message}
          </p>

          {/* Action button if provided */}
          {toast.action && (
            <div className="mt-2 flex items-center">
              <button
                type="button"
                onClick={() => {
                  toast.action?.onClick();
                  onDismiss();
                }}
                className="text-[11px] font-bold text-[#D32F2F] hover:text-[#B71C1C] flex items-center gap-1 hover:underline cursor-pointer bg-red-50/70 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors border border-red-100"
              >
                <span>{toast.action.label}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Dismiss Button */}
        <button
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition-colors shrink-0 cursor-pointer"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress countdown indicator */}
      {toast.duration && toast.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-100 overflow-hidden">
          <div
            className={`h-full ${progressColor} transition-all`}
            style={{
              animation: `toastProgress ${toast.duration}ms linear forwards`,
            }}
          />
        </div>
      )}
    </div>
  );
};
