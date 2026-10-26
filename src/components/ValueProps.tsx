import React from 'react';
import { useStore } from '../context/StoreContext';
import { Truck, HandCoins, Smartphone, ShieldCheck } from 'lucide-react';

export const ValueProps: React.FC = () => {
  const { t } = useStore();

  const props = [
    {
      icon: <Truck className="w-6 h-6 text-[#D32F2F]" />,
      title: t.freeHomeDeliveryTitle,
      sub: t.freeHomeDeliverySub,
      bg: 'bg-red-50',
    },
    {
      icon: <HandCoins className="w-6 h-6 text-[#D32F2F]" />,
      title: t.cashOnDeliveryTitle,
      sub: t.cashOnDeliverySub,
      bg: 'bg-red-50',
    },
    {
      icon: <Smartphone className="w-6 h-6 text-[#D32F2F]" />,
      title: t.bkashNagadTitle,
      sub: t.bkashNagadSub,
      bg: 'bg-red-50',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-[#D32F2F]" />,
      title: t.securePaymentTitle,
      sub: t.securePaymentSub,
      bg: 'bg-red-50',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-3 sm:py-5">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-4 sm:p-6 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
        {props.map((item, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-3.5 ${
              idx > 1 ? 'pt-3 sm:pt-0' : ''
            } ${idx > 0 ? 'lg:pl-6' : ''}`}
          >
            <div className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center shrink-0`}>
              {item.icon}
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-gray-900 leading-snug">
                {item.title}
              </h3>
              <p className="text-[11px] sm:text-xs text-gray-500 font-medium">
                {item.sub}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
