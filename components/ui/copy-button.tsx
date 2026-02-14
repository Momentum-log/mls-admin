"use client";

import React, { useState } from "react";
import { FiCopy, FiCheck } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  text: string;
  className?: string;
  tooltipText?: string;
}

/**
 * A subtle copy-to-clipboard button with tooltip and success feedback.
 *
 * @param text - The string to be copied to the clipboard.
 * @param className - Additional classes for the button container.
 * @param tooltipText - Custom tooltip text (defaults to "Copy to clipboard").
 */
const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  className,
  tooltipText = "Copy to clipboard",
}) => {
  const [copied, setCopied] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent parent link clicks

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div
      className={cn("relative inline-flex items-center", className)}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <button
        onClick={handleCopy}
        className={cn(
          "p-1.5 rounded-md transition-all duration-200",
          "text-gray-400 opacity-40 hover:opacity-100 hover:bg-gray-100",
          copied && "text-green-600 opacity-100 bg-green-50",
        )}
        aria-label={copied ? "Copied" : tooltipText}
      >
        <AnimatePresence mode="wait">
          {copied ? (
            <motion.div
              key="check"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.1 }}
            >
              <FiCheck className="w-3.5 h-3.5" />
            </motion.div>
          ) : (
            <motion.div
              key="copy"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.1 }}
            >
              <FiCopy className="w-3.5 h-3.5" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {(showTooltip || copied) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: -30, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className={cn(
              "absolute left-1/2 -translate-x-1/2 px-2 py-1 text-[10px] font-bold rounded shadow-xl whitespace-nowrap pointer-events-none z-50",
              copied ? "bg-green-600 text-white" : "bg-gray-900 text-white",
            )}
          >
            {copied ? "Copied!" : tooltipText}
            {/* Tooltip Arrow */}
            <div
              className={cn(
                "absolute bottom-[-4px] left-1/2 -translate-x-1/2 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4",
                copied ? "border-t-green-600" : "border-t-gray-900",
              )}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CopyButton;
