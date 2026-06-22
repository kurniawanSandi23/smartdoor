import React, { forwardRef } from 'react';

const Input = forwardRef(({ label, error, icon: Icon, ...props }, ref) => {
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block font-sans">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400/80 pointer-events-none">
            <Icon size={16} className="stroke-[2.2]" />
          </span>
        )}
        <input
          ref={ref}
          {...props}
          className={`w-full ${Icon ? 'pl-10' : 'px-4'} pr-4 py-3 bg-white border ${
            error 
              ? 'border-red-400 focus:border-red-500 focus:ring-red-100' 
              : 'border-slate-200 hover:border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/10'
          } rounded-xl transition-all duration-150 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:bg-slate-50 text-sm text-slate-900 placeholder-slate-400 font-medium`}
        />
      </div>
      {error && <p className="text-xs font-semibold text-red-500 mt-1 pl-1">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;