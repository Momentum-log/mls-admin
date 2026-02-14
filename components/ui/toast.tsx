"use client";

import React, { useEffect } from "react";
import { Toast, useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle,
  FaTimes,
  FaExclamationTriangle,
} from "react-icons/fa";

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const toastVariants = {
  initial: { opacity: 0, y: -20, scale: 0.9 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -20, scale: 0.9, transition: { duration: 0.2 } },
};

const icons = {
  success: <FaCheckCircle className="w-6 h-6 text-green-500" />,
  error: <FaExclamationCircle className="w-6 h-6 text-red-500" />,
  info: <FaInfoCircle className="w-6 h-6 text-blue-500" />,
  warning: <FaExclamationTriangle className="w-6 h-6 text-amber-500" />,
};

interface ToastItemProps {
  toast: Toast;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast }) => {
  const removeToast = useToast((state) => state.removeToast);
  const [isPaused, setIsPaused] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined);
  const startTimeRef = React.useRef<number>(0);
  const remainingTimeRef = React.useRef<number>(toast.duration || 5000);

  const [msgDuration, setMsgDuration] = React.useState<number>(
    toast.duration || Math.max(5000, (toast.message?.length || 0) * 50)
  );

  useEffect(() => {
    // Re-eval if props change, though usually toast instance is static
    const calcDuration =
      toast.duration || Math.max(5000, (toast.message?.length || 0) * 50);
    remainingTimeRef.current = calcDuration;
    setMsgDuration(calcDuration);
  }, [toast.duration, toast.message]);

  useEffect(() => {
    if (isPaused) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      return;
    }

    startTimeRef.current = Date.now();
    timeoutRef.current = setTimeout(() => {
      removeToast(toast.id);
    }, remainingTimeRef.current);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isPaused, removeToast, toast.id]);

  const handleMouseEnter = () => {
    setIsPaused(true);
    const elapsed = Date.now() - startTimeRef.current;
    const newRemaining = Math.max(0, remainingTimeRef.current - elapsed);
    remainingTimeRef.current = newRemaining;
    setMsgDuration(newRemaining);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  return (
    <motion.div
      variants={toastVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      layout
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative w-full max-w-sm flex items-start gap-4 p-4 rounded-2xl shadow-2xl overflow-hidden cursor-pointer group",
        "backdrop-blur-md bg-white/80 border border-white/20 shadow-2xl", // White glass look
        "text-black! dark:text-black!", // Force black text on white glass, disregarding all other themes
        "hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200 ease-out" // Subtle interaction
      )}
    >
      {/* Type Indicator Line */}
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-1.5",
          toast.type === "success" && "bg-green-500",
          toast.type === "error" && "bg-red-500",
          toast.type === "info" && "bg-blue-500",
          toast.type === "warning" && "bg-amber-500",
          !toast.type && "bg-gray-500",
          "group-hover:w-2 transition-all duration-300" // Expand on hover
        )}
      />

      {/* Icon with Hover Animation */}
      <div className="shrink-0 pt-0.5 group-hover:animate-bounce">
        {icons[toast.type || "info"]}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {toast.title && (
          <h4 className="font-bold text-gray-800 text-sm mb-1 line-clamp-1">
            {toast.title}
          </h4>
        )}
        <p className="text-gray-400  text-sm leading-relaxed max-w-full wrap-break-word font-medium">
          {toast.message}
        </p>
      </div>

      {/* Close Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          removeToast(toast.id);
        }}
        className="shrink-0 p-1 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
      >
        <FaTimes className="w-3 h-3" />
      </button>

      {/* Progress Bar (Visualizing Timer) */}
      {!isPaused && (
        <motion.div
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{
            duration: (msgDuration || 5000) / 1000,
            ease: "linear",
          }}
          className={cn(
            "absolute bottom-0 left-0 right-0 h-1 origin-left opacity-30",
            toast.type === "success" && "bg-green-500",
            toast.type === "error" && "bg-red-500",
            toast.type === "info" && "bg-blue-500",
            toast.type === "warning" && "bg-amber-500"
          )}
        />
      )}
    </motion.div>
  );
};

export const ToastContainer = () => {
  const toasts = useToast((state) => state.toasts);

  return (
    <div className="fixed top-4 right-4 z-9999 flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};
