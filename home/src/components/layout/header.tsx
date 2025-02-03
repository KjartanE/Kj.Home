"use client";

import { Terminal } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import HomeLogo from "@/assets/icons/HomeLogo";
import { NavMenu } from "./nav-menu";
import { ModeToggle } from "./mode-toggle";
export const Header = () => {
  const router = useRouter();

  return (
    <header className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/">
            <div className="flex items-center gap-2">
              <HomeLogo />
              <span className="hidden font-mono text-lg font-bold sm:inline-flex">kj.home</span>
            </div>
          </Link>
          <NavMenu />
        </div>
        <ModeToggle />
      </div>
    </header>
  );
};
