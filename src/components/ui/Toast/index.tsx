"use client";

import React from 'react';
import { useToast, Toast as ToastType } from '@/contexts/ToastContext';

const Toast: React.FC<{ toast: ToastType }> = ({ toast }) => {
  const { removeToast } = useToast();

  const icons = {
    success: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    warning: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    info: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  const themeClasses = {
    success: 'bg-green-50/90 dark:bg-green-950/40 border-green-200 dark:border-green-800 text-green-900 dark:text-green-100 shadow-green-100/10 dark:shadow-none',
    error: 'bg-red-50/90 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100 shadow-red-100/10 dark:shadow-none',
    warning: 'bg-yellow-50/90 dark:bg-yellow-950/40 border-yellow-200 dark:border-yellow-800 text-yellow-900 dark:text-yellow-100 shadow-yellow-100/10 dark:shadow-none',
    info: 'bg-blue-50/90 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100 shadow-blue-100/10 dark:shadow-none',
  };

  const iconContainerClasses = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-white',
    info: 'bg-blue-500 text-white',
  };

  const progressBarClasses = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  };

  const duration = toast.duration || 5000;

  return (
    <div 
      className={`relative flex items-start gap-4 rounded-xl border ${themeClasses[toast.type]} pl-4 pr-5 py-4 shadow-xl backdrop-blur-md transition-all duration-300 animate-slideIn max-w-sm overflow-hidden`}
    >
      {/* Icon Circle */}
      <div className={`flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full ${iconContainerClasses[toast.type]} shadow-sm`}>
        {icons[toast.type]}
      </div>
      
      {/* Text Info */}
      <div className="flex-1 min-w-0 pr-2 self-center">
        <h5 className="font-bold text-xs leading-snug">{toast.title}</h5>
      </div>

      {/* Close Button */}
      <button
        onClick={() => removeToast(toast.id)}
        className="flex-shrink-0 text-body-color hover:text-black dark:text-gray-400 dark:hover:text-white opacity-60 hover:opacity-100 transition-all rounded p-0.5"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Progress Bar Timer */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 w-full h-[3px] bg-black/5 dark:bg-white/5">
          <div 
            style={{ animationDuration: `${duration}ms` }}
            className={`h-full ${progressBarClasses[toast.type]} animate-toastProgress`} 
          />
        </div>
      )}
    </div>
  );
};

const ToastContainer: React.FC = () => {
  const { toasts } = useToast();

  return (
    <div className="fixed top-24 right-6 z-[99999] flex flex-col gap-4 max-w-sm">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  );
};

export default ToastContainer;
