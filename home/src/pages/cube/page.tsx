import ThreeScene from "./components/ThreeScene";

export const metadata = {
  title: "Cube",
  description: "heres a cube I made"
};

export default function Page() {
  return (
    <section className="flex justify-center">
      <ThreeScene />
    </section>
  );
}
