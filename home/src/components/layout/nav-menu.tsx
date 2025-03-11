"use client";

import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";
import HomeLogo from "@/assets/icons/HomeLogo";

interface NavMenuProps {
  mobile?: boolean;
  onSelect?: () => void;
}

export function NavMenu({ mobile, onSelect }: NavMenuProps) {
  const mobileClasses = mobile ? "flex flex-col space-y-3" : "";
  const linkClasses = mobile
    ? "flex w-full p-3 hover:bg-accent rounded-md transition-colors text-foreground"
    : navigationMenuTriggerStyle();

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

  // Original NavigationMenu implementation for desktop
  return (
    <NavigationMenu className="relative z-30 bg-transparent">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="bg-transparent">Projects</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="flex flex-col p-4 w-[300px] md:w-[500px] lg:w-[800px]">
              {/* Projects Header */}
              <div className="mb-4">
                <NavigationMenuLink asChild>
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
                </NavigationMenuLink>
              </div>

              {/* Categories */}
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {/* Mathematics & Simulations */}
                <div>
                  <div className="font-medium mb-2 text-sm text-muted-foreground">Mathematics & Simulations</div>
                  <ul className="space-y-1">
                    <ListItem href="/projects/penrose" title="Penrose">
                      Penrose Tiling pattern generator
                    </ListItem>
                    <ListItem href="/projects/chladni" title="Chladni">
                      Chladni plate vibration patterns
                    </ListItem>
                    <ListItem href="/projects/pendulum" title="Double Pendulum">
                      Interactive physics simulation
                    </ListItem>
                    <ListItem href="/projects/spirograph" title="Spirograph">
                      Interactive spirograph simulation
                    </ListItem>
                    <ListItem href="/projects/mandelbrot" title="Mandelbrot">
                      Mandelbrot Set visualization
                    </ListItem>
                  </ul>
                </div>
                
                {/* 3D Visualizations */}
                <div>
                  <div className="font-medium mb-2 text-sm text-muted-foreground">3D Visualizations</div>
                  <ul className="space-y-1">
                    <ListItem href="/projects/cube" title="Cube">
                      3D Cube Rendering
                    </ListItem>
                    <ListItem href="/projects/solar" title="Solar System">
                      Solar System visualization
                    </ListItem>
                    {/* Add more 3D projects as needed */}
                  </ul>
                </div>
                
                {/* Music & Audio */}
                <div>
                  <div className="font-medium mb-2 text-sm text-muted-foreground">Music & Audio</div>
                  <ul className="space-y-1">
                    {/* Music projects will go here when added */}
                    <ListItem href="/projects/waveform" title="Waveform">
                      Waveform visualization
                    </ListItem>
                    <ListItem href="/projects/butterchurn" title="Butterchurn">
                      Butterchurn visualization
                    </ListItem>
                  </ul>
                </div>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem className="bg-transparent">
          <Link href="/about" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>About</NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem className="bg-transparent">
          <Link href="/blog" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>Blog</NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem className="bg-transparent">
          <Link href="/contact" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>Contact</NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

const ListItem = React.forwardRef<React.ElementRef<"a">, React.ComponentPropsWithoutRef<"a">>(
  ({ className, title, children, ...props }, ref) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <a
            ref={ref}
            className={cn(
              "block select-none space-y-1 rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
              className
            )}
            {...props}>
            <div className="text-sm font-medium leading-none">{title}</div>
            <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">{children}</p>
          </a>
        </NavigationMenuLink>
      </li>
    );
  }
);
ListItem.displayName = "ListItem";
