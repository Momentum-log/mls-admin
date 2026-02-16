"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "react-hot-toast";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          className: "font-sans border-none shadow-2xl rounded-2xl",
          style: {
            background: "#ffffff",
            color: "#171717",
            padding: "12px 16px",
            fontSize: "14px",
            maxWidth: "400px",
            backdropFilter: "blur(8px)",
            backgroundColor: "rgba(255, 255, 255, 0.85)",
            border: "1px solid rgba(229, 229, 229, 0.2)",
          },
          success: {
            iconTheme: {
              primary: "#005db1",
              secondary: "#ffffff",
            },
          },
          error: {
            iconTheme: {
              primary: "#dc2626",
              secondary: "#ffffff",
            },
          },
        }}
      />
    </QueryClientProvider>
  );
}
