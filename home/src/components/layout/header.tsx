"use client";

import HomeLogo from "@/assets/icons/HomeLogo";
import { NavMenu } from "./nav-menu";
import { ModeToggle } from "./mode-toggle";
import Link from "next/link";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger, SheetDescription } from "../ui/sheet";

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-border/40 backdrop-blur-sm">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/" className="flex items-center gap-2">
            <HomeLogo width={50} height={50} />
            <span className="font-mono text-lg font-bold sm:inline-flex">kj.home</span>
          </Link>
          <div className="hidden md:block">
            <NavMenu />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[80vw] sm:w-[350px]">
              <SheetTitle>Nav-Menu</SheetTitle>
              <SheetDescription>kj.home</SheetDescription>
              <div className="mt-6">
                <NavMenu mobile onSelect={() => setIsOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
