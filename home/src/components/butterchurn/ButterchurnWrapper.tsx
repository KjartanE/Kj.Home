"use client";

import dynamic from 'next/dynamic';

const ButterchurnScene = dynamic(
  () => import('./ButterchurnScene'),
  { ssr: false }
);

export default function ButterchurnWrapper() {
  return (
    <div className="fixed inset-0">
      <ButterchurnScene />
    </div>
  );
} 