import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "../components/providers/theme-provider";
import { Header } from "@/components/layout/header";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  metadataBase: new URL("https://kjhome.dev"),
  title: {
    default: "kj.home",
    template: "%s | kj.home"
  },
  description: "Personal portfolio and creative coding projects by Kjartan Einarsson. Interactive Three.js visualizations, web experiments, and blog.",
  icons: {
    icon: "/favicon.ico"
  },
  openGraph: {
    title: "kj.home",
    description: "Personal portfolio and creative coding projects by Kjartan Einarsson.",
    url: "https://kjhome.dev",
    siteName: "kj.home",
    type: "website",
    locale: "en_US"
  },
  twitter: {
    card: "summary_large_image",
    title: "kj.home",
    description: "Personal portfolio and creative coding projects by Kjartan Einarsson."
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <ThemeProvider attribute="class" defaultTheme="dark">
          <Header />
          <main className="flex-1">{children}</main>
        </ThemeProvider>
        <Toaster />
      </body>
      <Analytics />
    </html>
  );
}
