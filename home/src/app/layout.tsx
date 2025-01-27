import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import clsx from "clsx";

import { Providers } from "../utils/providers";

import { siteConfig } from "@/public/config/site";
import { fontSans } from "@/public/config/fonts";
import { Navbar } from "@/src/components/navbar";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico"
  }
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" }
  ]
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body className={clsx("min-h-screen bg-background font-sans antialiased", fontSans.variable)}>
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          <div className="relative flex h-screen flex-col">
            <Navbar />
            <main className="container mx-auto w-full flex-grow px-4">{children}</main>
            {/* <footer className="flex w-full items-center justify-center py-3">
              <Link
                isExternal
                className="flex items-center gap-1 text-current"
                href={siteConfig.links.linkedin}
                title="nextui.org homepage">
                <span className="text-default-600">Created by</span>
                <p className="text-primary">Kjartan Einarsson</p>
              </Link>
            </footer> */}
          </div>
        </Providers>
      </body>
    </html>
  );
}
