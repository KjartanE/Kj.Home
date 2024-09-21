import "./global.css"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Navbar } from "./components/nav"
import Footer from "./components/footer"
import { baseUrl } from "./sitemap"

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Kj.Home",
    template: "%s | Kj.Home",
  },
  description: "this is my website",
  openGraph: {
    title: "my website",
    description: "this is my website",
    url: baseUrl,
    siteName: "my website",
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

const cx = (...classes) => classes.filter(Boolean).join(" ")

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={cx(
        "text-black bg-white dark:text-white dark:bg-black",
        GeistSans.variable,
        GeistMono.variable
      )}
    >
      <body className="flex content-center justify-center">
        <main
          className="flex flex-col justify-between px-4 py-8"
          style={{ height: "100vh", width: "100vw" }}
        >
          <div className="flex flex-col items-center justify-center">
            <Navbar />
          </div>
          {children}
          <div className="flex flex-col items-center justify-center">
            <Footer />
          </div>
        </main>
      </body>
    </html>
  )
}
