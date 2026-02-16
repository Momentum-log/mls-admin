import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/providers";

export const metadata: Metadata = {
  title: "Momentum Logistics | Admin Management Suite",
  description:
    "Advanced logistics management, tracking, and analytics for Momentum Logistics Service.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-primary">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
