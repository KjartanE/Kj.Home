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
import { useTheme } from "next-themes";

interface NavMenuProps {
  mobile?: boolean;
  onSelect?: () => void;
}

export function NavMenu({ mobile, onSelect }: NavMenuProps) {
  const { resolvedTheme } = useTheme();
  const fillColor = resolvedTheme && resolvedTheme === "dark" ? "#ffffff" : "#000000";
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
            <ul className="grid w-[300px] gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <Link
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                    href="/projects">
                    <HomeLogo fillColor={fillColor} />
                    <div className="mb-2 mt-4 text-lg font-medium">Projects</div>
                    <p className="text-sm leading-tight text-muted-foreground">
                      Check out some interesting projects I&apos;ve worked on.
                    </p>
                  </Link>
                </NavigationMenuLink>
              </li>
              <ListItem href="/projects/cube" title="Cube">
                Cube Rendering
              </ListItem>
              <ListItem href="/projects/penrose" title="Penrose">
                Penrose Rendering
              </ListItem>
              <ListItem href="/projects/chladni" title="Chladni">
                Chladni Patterns
              </ListItem>
              <ListItem href="/projects/pendulum" title="Pendulum">
                Double Pendulum Physics.
              </ListItem>
              <ListItem href="/projects/solar" title="Solar">
                Solar System.
              </ListItem>
              <ListItem href="/projects/spirograph" title="Spirograph">
                Spirograph.
              </ListItem>
              <ListItem href="/projects/mandelbrot" title="Mandelbrot">
                Mandelbrot Set.
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/about" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>About</NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/blog" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>Blog</NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
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
              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
              className
            )}
            {...props}>
            <div className="text-sm font-medium leading-none">{title}</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{children}</p>
          </a>
        </NavigationMenuLink>
      </li>
    );
  }
);
ListItem.displayName = "ListItem";
