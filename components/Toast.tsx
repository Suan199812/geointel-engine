
import React, { useState, useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'info' | 'error' | 'success';
  onClose: () => void;
}

const typeClasses = {
  info: {
    bg: 'bg-blue-900/80',
    border: 'border-blue-700',
    icon: (
      <svg className="w-5 h-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
      </svg>
    ),
  },
  success: {
    bg: 'bg-green-900/80',
    border: 'border-green-700',
    icon: (
      <svg className="w-5 h-5 text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  error: {
    bg: 'bg-red-900/80',
    border: 'border-red-700',
    icon: (
      <svg className="w-5 h-5 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
    ),
  },
};

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      // Let the exit animation play before calling onClose
      const exitTimer = setTimeout(onClose, 300); 
      return () => clearTimeout(exitTimer);
    }, 5000); // Auto-dismiss after 5 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300);
  };

  const classes = typeClasses[type] || typeClasses.info;

  return (
    <div className="fixed top-20 right-4 z-[100]">
      <div
        className={`flex items-center p-4 rounded-lg shadow-lg backdrop-blur-md border ${classes.bg} ${classes.border} ${isExiting ? 'animate-toast-out' : 'animate-toast-in'}`}
        role="alert"
      >
        <div className="flex-shrink-0">{classes.icon}</div>
        <div className="ml-3 text-sm font-medium text-gray-200">{message}</div>
        <button
          onClick={handleClose}
          type="button"
          className="ml-4 -mr-1.5 -my-1.5 bg-transparent text-gray-400 hover:text-white rounded-lg p-1.5 inline-flex items-center justify-center h-8 w-8 transition-colors"
          aria-label="Dismiss"
        >
          <span className="sr-only">Dismiss</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};
