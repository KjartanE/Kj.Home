import "./global.css"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Navbar } from "./components/nav"
// import { Analytics } from '@vercel/analytics/react'
// import { SpeedInsights } from '@vercel/speed-insights/next'
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
      <body className="antialiased max-w-2xl mx-4 mt-8 lg:mx-auto">
        <main className="flex flex-col justify-between " style={{height: '95vh'}}>
          <Navbar />
          {children}
          <Footer />
          {/* <Analytics /> */}
          {/* <SpeedInsights /> */}
        </main>
      </body>
    </html>
  )
}
