import { IResume } from "@/types";

export const resume: IResume = {
  personal: {
    name: "Kjartan Einarsson",
    title: "Senior Full Stack Software Engineer",
    email: "kjartanreinarsson@gmail.com",
    description:
      "I'm a senior full stack engineer and DevOps specialist shipping digital services for the BC Government and enterprise — Vue 3, React, TypeScript, Node.js, and Python on top of PostgreSQL, OpenShift, and CI/CD pipelines. After hours I make generative art, build hardware, and chase interesting math in the browser.",
    location: "Victoria, BC, Canada",
    website: "https://www.forritun.dev",
    linkedin: "https://www.linkedin.com/in/kjartane",
    github: "https://github.com/KjartanE",
    youtube: "https://www.youtube.com/@kjartan-e"
  },
  highlights: [
    {
      role: "Senior Full Stack Developer",
      org: "Quartech — BC Gov Digital Trust (CDT)",
      project: "BC Wallet Mobile / BC Services Card",
      start: "Oct 2025",
      end: "Present",
      summary:
        "Developing the BC Services Card app and integrating BC Wallet so citizens can manage digital credentials and access government services in one mobile app.",
      bullets: [
        "Designed ScreenWrapper, a shared Bifold component adopted across every screen in bc-wallet for consistent sizing, safe areas, and scroll behaviour",
        "Built verification and onboarding flows: resume verification, approval notifications, and device invalidation / forced de-registration",
        "Shipped PIN and security-method flows, global error handling, i18n for all BCSC v4 screens, and CI improvements with GitHub Actions and SonarCloud"
      ],
      tech: ["React Native", "TypeScript", "Bifold", "Credo-TS", "Swift", "Kotlin"]
    },
    {
      role: "Senior Full Stack Developer",
      org: "Quartech — Digital Trust Services (QDTS)",
      start: "Oct 2024",
      end: "Oct 2025",
      summary:
        "Internal SaaS for issuing, holding, and managing blockchain-based verifiable credentials for government and business.",
      bullets: [
        "Designed Helm charts and GitHub Actions workflows for five applications on Quartech's Azure Kubernetes cluster",
        "Migrated the API database from AWS DynamoDB to self-hosted MongoDB wired in as a Helm chart dependency",
        "Built the Issuer Demo admin panel — tenant invitations and credential management behind Keycloak OIDC"
      ],
      tech: ["TypeScript", "Node.js", "Kubernetes", "Helm", "Docker", "Keycloak"]
    },
    {
      role: "Senior Full Stack Developer / QA Specialist",
      org: "BC Ministry of Water, Land & Resource Stewardship",
      project: "NERT · SIMS/BioHub · HRT",
      start: "Dec 2021",
      end: "Sep 2024",
      summary:
        "Three GIS-based environmental platforms for restoration tracking and species inventory across BC, delivered OpenShift-native with GitOps/IaC practices.",
      bullets: [
        "Led enterprise web application development with React, Node.js, and TypeScript on OpenShift 4.x",
        "Redesigned RESTful APIs to OpenAPI conventions with layered endpoint/service/repository architecture",
        "Owned PostgreSQL schema design, migrations, and tuning across DEV/TEST/PROD, plus Leaflet mapping and GC Notify integration"
      ],
      tech: ["React", "Material-UI", "Node.js", "PostgreSQL", "OpenShift", "Leaflet"]
    },
    {
      role: "Full Stack Developer",
      org: "Quartech — Investment Agriculture Foundation",
      project: "BuyBC verifiable credentials",
      start: "Jan 2023",
      end: "Apr 2023",
      summary:
        "Vue 3 issuer and verifier apps demonstrating verifiable-credential issuance for organizations in OrgBook BC.",
      tech: ["Vue 3", "TypeScript", "Docker"]
    },
    {
      role: "Full Stack Developer",
      org: "SYNQ Tech",
      start: "Jun 2020",
      end: "Dec 2020",
      summary:
        "Real-time integration and analytics platform. Built the company site, network check-in software for company assets, and a prototype remote-access locker system — wiring, soldering, and firmware included.",
      tech: ["Python", "MySQL", "Raspberry Pi", "Linux"]
    }
  ],
  skillGroups: [
    {
      label: "Languages",
      items: ["TypeScript / JavaScript", "Python", "Java", "C / C++", "Bash", "SQL"]
    },
    {
      label: "Front-End",
      items: ["Vue 3", "Nuxt", "React", "React Native", "Next.js", "Vite", "Tailwind CSS", "Material-UI", "shadcn/ui"]
    },
    {
      label: "Back-End & APIs",
      items: ["Node.js", "Express", "Flask", "FastAPI", "Django", "Spring Boot", "REST / OpenAPI 3.x"]
    },
    {
      label: "Data & Messaging",
      items: ["PostgreSQL", "MySQL", "MongoDB", "DynamoDB", "Redis", "RabbitMQ"]
    },
    {
      label: "DevOps & Cloud",
      items: ["OpenShift 4.x", "Docker", "Kubernetes", "Helm", "GitOps / IaC", "GitHub Actions", "Azure AKS", "AWS"]
    },
    {
      label: "Testing & Delivery",
      items: ["Jest", "Mocha", "Cypress", "Selenium", "JMeter", "Agile / Scrum", "Code review & mentoring"]
    }
  ],
  education: [
    {
      school: "University of Victoria",
      degree: "Bachelor of Software Engineering",
      date: "2017 – 2024"
    }
  ],
  certifications: [
    { title: "AWS Cloud Practitioner", issuer: "Amazon Web Services", date: "2024" },
    { title: "OpenShift 101/201", issuer: "BC Government", date: "2024" },
    { title: "Certified Practitioner in Agile Development Practices" }
  ],
  awards: ["Victoria Lions Club Directors Scholarship", "University of Victoria Entrance Scholarship"],
  creativeProjects: [
    {
      title: "Genuary & generative art",
      description:
        "Daily generative-art sketches with canvas-sketch, P5.js, and Three.js — L-systems, reaction–diffusion, tilings, and spirographs.",
      href: "/projects"
    },
    {
      title: "Custom pen plotter",
      description:
        "Designed and built end-to-end: frame, motion control, and firmware. Browser sketches export G-code tuned to the machine, so generative pieces run from code to paper.",
      href: "/projects/spirograph"
    },
    {
      title: "Hardware synthesizers",
      description: "Designing and building hardware synths — exploring sound synthesis from the oscillators up.",
      href: "/projects/waveform"
    }
  ]
};
