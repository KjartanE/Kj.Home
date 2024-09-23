import ThreeScene from "./ThreeScene"

export const metadata = {
  title: "Cube",
  description: "heres a cube I made",
}

export default function Page() {
  return (
    <section className="flex justify-center">
      {/* <h1 className="font-semibold text-2xl mb-8 tracking-tighter">Cube</h1> */}
      <ThreeScene />
    </section>
  )
}
