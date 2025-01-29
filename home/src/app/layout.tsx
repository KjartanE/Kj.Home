import { Metadata, Viewport } from "next";
import clsx from "clsx";
import { Providers } from "../lib/providers";
import { Navbar } from "../lib/components/nav/navbar";
import { siteConfig } from "../../public/config/site";
import { fontSans } from "../../public/config/fonts";


export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`
  },
  description: siteConfig.description,
  icons: {
    icon: "/icons/favicon.ico"
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
          </div>
        </Providers>
      </body>
    </html>
  );
}
