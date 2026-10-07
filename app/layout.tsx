import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tikit Railway booking, simplified",
  description:
    "Tikit books train tickets for the common man in under 6 taps app, AI chat, or a phone call from any feature phone.",
  icons: { icon: "/tikit-icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#2a4fe4",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh antialiased">
        <TooltipProvider delay={100}>
          <Toaster>{children}</Toaster>
        </TooltipProvider>
      </body>
    </html>
  );
}
