"use client";

import dynamic from 'next/dynamic';

const ButterchurnScene = dynamic(
  () => import('./ButterchurnScene'),
  { ssr: false }
);

export default function ButterchurnWrapper() {
  return (
    <div className="absolute inset-0">
      <ButterchurnScene />
    </div>
  );
} 