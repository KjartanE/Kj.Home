import { Card } from "@/components/ui/card";
import React from "react";

const ProjectsComponent: React.FC = () => {
  return (
    <Card className="p-8">
      <p className="pb-4 text-2xl font-bold">Passion Projects:</p>
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
  );
};

export default ProjectsComponent;
