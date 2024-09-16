import ThreeScene from "./ThreeScene"

export const metadata = {
  title: "Chladni",
  description: "heres a chladni I made",
}

export default function Page() {
  return (
    <section className="flex justify-center">
      <ThreeScene />
    </section>
  )
}
