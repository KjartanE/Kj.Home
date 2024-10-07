import React from "react";
import { Card, Image } from "@nextui-org/react";

const IntroductionComponent: React.FC = () => {
  return (
    <Card className="space-y-4 rounded-xl p-6 shadow-md">
      <div className="flex">
        <Image src="/clancy.png" alt="Profile Image" className="rounded-full" />
        <div className="ml-4 flex flex-col justify-center">
          <p className="p-4 text-2xl font-bold">Kjartan Robert Einarsson</p>
          <p className="p-4 text-gray-400">
            I am a Software Engineer with a passion for building things.
          </p>
          <p className="p-4 text-gray-400">
            I am currently working as a Software Engineer at Quartech ltd. In Victoria B.C. As a full-stack developer,
            working on a variety of projects for the BC Government.
          </p>
        </div>
      </div>
      <Card className="p-8">
        <p className="text-2xl font-bold pb-4">Passion Projects:</p>
        <ul>
          <li>Eurorack Modular Synthesizer</li>
          <li>Audio Reactive Visualizers</li>
          <li>Home Linux Server [Debian Server, Docker, Nextcloud, Pi-hole, NAS]</li>
          <li>Personal Website [Next.js, TailwindCSS, NextUI]</li>
          <li>3D Render with Processing, P5.js, ThreeJS, Blender.</li>
          <li>Building Phob2.0 Gamecube controllers</li>
          <li>Reactive Lamp [Lamprichauns/lamp-os] </li>
          <li>Small format Electronics [Arduino, ESP32, STM32, Raspberry Pi 3-4 ]</li>
        </ul>
      </Card>
    </Card>
  );
};

export default IntroductionComponent;
