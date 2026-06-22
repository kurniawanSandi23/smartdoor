import React from 'react';
import { RefreshCw } from 'lucide-react';

export default function Button({ children, isLoading, disabled, ...props }) {
  return (
    <button
      {...props}
      disabled={isLoading || disabled}
      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-600/20 focus:outline-none focus:ring-4 focus:ring-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center text-sm tracking-wide"
    >
      {isLoading && <RefreshCw className="animate-spin mr-2" size={18} />}
      {children}
    </button>
  );
}