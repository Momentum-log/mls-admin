"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

/**
 * LoginBackground component provides a minimal, professional background for the login page.
 * features a subtle grid and slow, faint light pulses to avoid distraction.
 */
export const LoginBackground: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="absolute inset-0 bg-white" />;

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#fafafa]">
      {/* Subtle Geometric Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#005db1 0.5px, transparent 0.5px), linear-gradient(90deg, #005db1 0.5px, transparent 0.5px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Extremely Subtle Moving Light Pulses */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`light-${i}`}
            className="absolute rounded-full blur-[150px]"
            style={{
              width: 600 + i * 200,
              height: 600 + i * 200,
              background:
                i % 2 === 0
                  ? "rgba(0, 93, 177, 0.04)"
                  : "rgba(252, 180, 23, 0.03)",
              left: i === 0 ? "-10%" : i === 1 ? "60%" : "20%",
              top: i === 0 ? "-10%" : i === 1 ? "40%" : "70%",
            }}
            animate={{
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 15 + i * 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Soft Bottom Gradient */}
      <div className="absolute inset-0 bg-linear-to-t from-white via-transparent to-transparent opacity-60" />
    </div>
  );
};
