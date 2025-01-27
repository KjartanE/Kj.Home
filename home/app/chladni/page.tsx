"use client";

import MenuButton from "@/components/menu";
import ThreeScene from "./components/ThreeScene";

export default function Page() {
  return (
    <section className="flex justify-center">
      <ThreeScene />

      <MenuButton open={true}>
        <div id="menu">
          <h1 className="text-2xl">Chladni</h1>
          <p className="text-gray-500">A simple Chladni plate simulation</p>
          <div id="controls" />
        </div>
      </MenuButton>
    </section>
  );
}
