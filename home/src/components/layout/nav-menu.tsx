"use client";

import * as React from "react";
import Link from "next/link";

import HomeLogo from "@/assets/icons/HomeLogo";
import { CustomDropdown, DropdownItem } from "@/components/ui/custom-dropdown";
import { ChevronDown } from "lucide-react";
import { PROJECTS, CATEGORY_META, type ProjectCategory } from "@/constants/projects";

interface NavMenuProps {
  mobile?: boolean;
  onSelect?: () => void;
}

const NAV_CATEGORIES: ProjectCategory[] = ["Math", "3D", "Music"];

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
      </nav>
    );
  }

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

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {NAV_CATEGORIES.map((category) => (
                  <div key={category}>
                    <div className="mb-2 text-sm font-medium text-muted-foreground">
                      {CATEGORY_META[category].label}
                    </div>
                    <ul className="space-y-1">
                      {PROJECTS.filter((p) => p.category === category).map((project) => (
                        <li key={project.slug}>
                          <DropdownItem href={`/projects/${project.slug}`} title={project.title}>
                            {project.description}
                          </DropdownItem>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
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
      </ul>
    </nav>
  );
}
