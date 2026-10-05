import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function Toast({ message, isVisible, title = 'Added to Cart!', variant = 'success' }) {
  if (!isVisible) return null;

  const isError = variant === 'error';

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] w-[90%] max-w-xs transition-all duration-300 ease-out animate-in fade-in slide-in-from-top-2">
      <div className={`flex items-center gap-3 rounded-full bg-white/95 px-4 py-2.5 shadow-xl border backdrop-blur-md ${isError ? 'border-red-300/80' : 'border-amber-300/80'}`}>
        {/* Icon Badge */}
        <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-white shadow-2xs ${isError ? 'bg-red-500' : 'bg-amber-400'}`}>
          {isError ? <AlertCircle className="h-4 w-4 stroke-[2.5]" /> : <CheckCircle2 className="h-4 w-4 stroke-[2.5]" />}
        </div>

        {/* Text Details */}
        <div className="flex-1 min-w-0 text-left">
          <p className={`text-[11px] font-black leading-tight ${isError ? 'text-red-500' : 'text-amber-500'}`}>
            {title}
          </p>
          <p className="text-[11px] font-semibold text-gray-700 truncate mt-0.5">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}