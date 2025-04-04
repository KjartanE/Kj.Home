"use client";

import * as React from "react";
import Link from "next/link";

import HomeLogo from "@/assets/icons/HomeLogo";
import { CustomDropdown, DropdownItem } from "@/components/ui/custom-dropdown";
import { ChevronDown } from "lucide-react";

interface NavMenuProps {
  mobile?: boolean;
  onSelect?: () => void;
}

export function NavMenu({ mobile, onSelect }: NavMenuProps) {
  const mobileClasses = mobile ? "flex flex-col space-y-3" : "";
  const linkClasses = mobile
    ? "flex w-full p-3 hover:bg-accent rounded-md transition-colors text-foreground"
    : "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2";

  if (mobile) {
    return (
      <nav className={mobileClasses} aria-label="Mobile navigation">
        <Link href="/projects" className={linkClasses} onClick={onSelect}>
          Projects
        </Link>
        <Link href="/about" className={linkClasses} onClick={onSelect}>
          About
        </Link>
        <Link href="/blog" className={linkClasses} onClick={onSelect}>
          Blog
        </Link>
        <Link href="/contact" className={linkClasses} onClick={onSelect}>
          Contact
        </Link>
      </nav>
    );
  }

  // Desktop navigation with custom dropdown
  return (
    <nav className="relative z-30 bg-transparent">
      <ul className="flex items-center space-x-4">
        <li>
          <CustomDropdown
            trigger={
              <button className={linkClasses}>
                Projects
                <ChevronDown className="relative top-[1px] ml-1 h-3 w-3 transition duration-300 hover:rotate-180" />
              </button>
            }
            className="w-[300px] md:w-[500px] lg:w-[800px]">
            <div className="flex flex-col p-4">
              {/* Projects Header */}
              <div className="mb-4">
                <Link
                  className="flex w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/40 to-muted p-4 no-underline outline-none focus:shadow-md"
                  href="/projects">
                  <div className="flex items-center">
                    <HomeLogo width={80} height={80} />
                    <div className="ml-4">
                      <div className="mb-1 text-lg font-medium">Projects</div>
                      <p className="text-sm leading-tight text-muted-foreground">
                        Check out some interesting projects I&apos;ve worked on.
                      </p>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Categories */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Mathematics & Simulations */}
                <div>
                  <div className="mb-2 text-sm font-medium text-muted-foreground">Mathematics & Simulations</div>
                  <ul className="space-y-1">
                    <li>
                      <DropdownItem href="/projects/penrose" title="Penrose">
                        Penrose Tiling pattern generator
                      </DropdownItem>
                    </li>
                    <li>
                      <DropdownItem href="/projects/chladni" title="Chladni">
                        Chladni plate vibration patterns
                      </DropdownItem>
                    </li>
                    <li>
                      <DropdownItem href="/projects/pendulum" title="Double Pendulum">
                        Interactive physics simulation
                      </DropdownItem>
                    </li>
                    <li>
                      <DropdownItem href="/projects/spirograph" title="Spirograph">
                        Interactive spirograph simulation
                      </DropdownItem>
                    </li>
                    <li>
                      <DropdownItem href="/projects/mandelbrot" title="Mandelbrot">
                        Mandelbrot Set visualization
                      </DropdownItem>
                    </li>
                  </ul>
                </div>

                {/* 3D Visualizations */}
                <div>
                  <div className="mb-2 text-sm font-medium text-muted-foreground">3D Visualizations</div>
                  <ul className="space-y-1">
                    <li>
                      <DropdownItem href="/projects/cube" title="Cube">
                        3D Cube Rendering
                      </DropdownItem>
                    </li>
                    <li>
                      <DropdownItem href="/projects/solar" title="Solar System">
                        Solar System visualization
                      </DropdownItem>
                    </li>
                    {/* Add more 3D projects as needed */}
                  </ul>
                </div>

                {/* Music & Audio */}
                <div>
                  <div className="mb-2 text-sm font-medium text-muted-foreground">Music & Audio</div>
                  <ul className="space-y-1">
                    {/* Music projects will go here when added */}
                    <li>
                      <DropdownItem href="/projects/waveform" title="Waveform">
                        Waveform visualization
                      </DropdownItem>
                    </li>
                    <li>
                      <DropdownItem href="/projects/butterchurn" title="Butterchurn">
                        Butterchurn visualization
                      </DropdownItem>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CustomDropdown>
        </li>
        <li>
          <Link href="/about" className={linkClasses}>
            About
          </Link>
        </li>
        <li>
          <Link href="/blog" className={linkClasses}>
            Blog
          </Link>
        </li>
        <li>
          <Link href="/contact" className={linkClasses}>
            Contact
          </Link>
        </li>
      </ul>
    </nav>
  );
}
