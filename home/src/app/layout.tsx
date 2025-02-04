import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "../components/providers/theme-provider";
import { Header } from "@/components/layout/header";
import { BackgroundLayout } from "@/components/layout/background-layout";

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
          <Header />
          <BackgroundLayout>
            <main className="flex-1">{children}</main>
          </BackgroundLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
