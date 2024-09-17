// import { ThreeLayout } from "app/layout"
import { GeistSans } from "geist/font/sans"
import ThreeScene from "./ThreeScene"
import { GeistMono } from "geist/font/mono"
import { Navbar } from "app/components/nav"
import Footer from "app/components/footer"

const cx = (...classes) => classes.filter(Boolean).join(" ")
function ThreeLayout({ children }: { children: React.ReactNode }) {
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
        <main
          className="flex flex-col justify-between "
          style={{ height: "95vh" }}
        >
          {children}
          <Navbar />
          <Footer />
        </main>
      </body>
    </html>
  )
}

export const metadata = {
  title: "tiles",
  description: "heres tiles I made",
}

export default function Page() {
  return (
    <section className="flex justify-center">
      {/* <h1 className="font-semibold text-2xl mb-8 tracking-tighter">Cube</h1> */}
      <ThreeScene />
    </section>
  )
}

Page.getLayout = function getLayout(page) {
  return <ThreeLayout>{page}</ThreeLayout>
}
