import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "../components/providers/theme-provider";
import { Header } from "@/components/layout/header";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/react";
import PersistentPenroseBackground from "@/components/penrose/background/PersistentPenroseBackground";

export const metadata: Metadata = {
  title: "kj.home",
  description: "kj.home",
  icons: {
    icon: "/favicon.ico"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <ThemeProvider attribute="class" defaultTheme="dark">
          <PersistentPenroseBackground />
          <Header />
          <main className="flex-1">{children}</main>
        </ThemeProvider>
        <Toaster />
      </body>
      <Analytics />
    </html>
  );
}
