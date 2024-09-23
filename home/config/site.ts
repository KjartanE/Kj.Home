export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "My Website",
  description: "I like to build things.",
  navItems: [
    {
      label: "Home",
      href: "/"
    },
    {
      label: "About",
      href: "/about"
    },
    {
      label: "Blog",
      href: "/blog"
    },
    {
      label: "Cube",
      href: "/cube"
    },
    {
      label: "Tiles",
      href: "/tiles"
    },
    {
      label: "Chladni",
      href: "/chladni"
    }
  ],
  navMenuItems: [
    {
      label: "Profile",
      href: "/profile"
    },
    {
      label: "Dashboard",
      href: "/dashboard"
    },
    {
      label: "Projects",
      href: "/projects"
    },
    {
      label: "Team",
      href: "/team"
    },
    {
      label: "Calendar",
      href: "/calendar"
    },
    {
      label: "Settings",
      href: "/settings"
    },
    {
      label: "Help & Feedback",
      href: "/help-feedback"
    },
    {
      label: "Logout",
      href: "/logout"
    }
  ],
  links: {
    github: "https://github.com/KjartanE",
    linkedin: "https://www.linkedin.com/in/kjartan-einarsson-05184719a/",
    docs: "https://github.com/KjartanE/Kj.Home"
    // discord: "https://discord.gg/9b6yyZKmH4",
    // sponsor: "https://patreon.com/jrgarciadev",
  }
};
