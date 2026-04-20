import { IResume } from "@/types";

export const resume: IResume = {
  personal: {
    name: "Kjartan Einarsson",
    email: "kjartanreinarsson@gmail.com",
    phone: "250-507-0444",
    description:
      "Senior Full Stack Engineer and DevOps specialist. Stack spans React, Vue 3, TypeScript, Node.js, Python, and PostgreSQL. Hands-on with OpenShift, GitOps/IaC, containerization, and CI/CD pipelines.",
    location: "Victoria, BC",
    linkedin: "https://www.linkedin.com/in/kjartane",
    github: "https://github.com/KjartanE",
    youtube: "https://www.youtube.com/@kjartan-e"
  },
  skills: [
    "RESTful API Development",
    "UI Web Design",
    "Data Structures and Algorithms",
    "Scalable Microservices",
    "Database Management",
    "Network Management",
    "Agile Development",
    "Team Mentoring and Development",
    "Code Review and PR Processes",
    "Cross-functional Team Collaboration",
    "Soldering and Wiring Hardware",
    "Home Server Automation",
    "Personal DevOps Solutions"
  ],
  technologies: [
    "OpenShift",
    "Linux",
    "GitHub/Git",
    "GitHub Actions",
    "GIS Leaflet",
    "Docker",
    "Kubernetes",
    "AWS",
    "Azure",
    "Helm",
    "React",
    "React-Native",
    "Vue.js",
    "Next.js",
    "Node.js",
    "Express",
    "Flask",
    "FastAPI",
    "Django",
    "Material-UI",
    "TailwindCSS",
    "MongoDB",
    "DynamoDB",
    "Keycloak",
    "OAuth2",
    "Hyperledger Aries",
    "ACA-Py",
    "Traction",
    "Caddy",
    "Nextcloud",
    "Portainer"
  ],
  languages: [
    "Java",
    "Python",
    "C/C++",
    "JavaScript",
    "TypeScript",
    "CSS",
    "HTML",
    "Bash",
    "Processing",
    "P5.js",
    "THREE.js",
    "PostgreSQL",
    "MySQL",
    "MariaDB",
    "MongoDB",
    "Jest/Mocha/Selenium",
    "Cypress"
  ],
  education: [
    {
      title: "Degree",
      school: "University of Victoria",
      degree: "Bachelor of Software Engineering",
      major: "Software Engineering",
      graduation: "June 2024",
      logo: "./uvic.jpg"
    },
    {
      title: "Certification",
      school: "Amazon Web Services",
      degree: "AWS Certified Cloud Practitioner",
      major: "Cloud Computing",
      graduation: "June 2024",
      logo: "./aws.png"
    },
    {
      title: "Certification",
      school: "B.C. Government",
      degree: "OpenShift 101-201",
      major: "Container Orchestration",
      graduation: "June 2024 – August 2024",
      logo: "./openshift.png"
    }
  ],
  certifications: [
    {
      title: "AWS Certified Cloud Practitioner",
      short: "AWS",
      date: "June 2024",
      description: "Entry-level certification for foundational AWS cloud services.",
      logo: "./aws.png"
    },
    {
      title: "B.C. Government, OpenShift 101",
      short: "OpenShift",
      date: "June 2024",
      description: "Introduction to OpenShift container orchestration platform.",
      logo: "./openshift.png"
    },
    {
      title: "B.C. Government, OpenShift 201",
      short: "OpenShift",
      date: "August 2024",
      description: "Intermediate course on OpenShift for containerized applications.",
      logo: "./openshift.png"
    }
  ],
  work_experience: [
    {
      company: "Quartech Systems Ltd",
      title: "Senior Full Stack Software Engineer",
      date: "September 2020 – Present",
      contract: [
        {
          id: "BCWALLET",
          label: "BC Wallet",
          title: "BCGOV – BC Wallet Mobile (BCSC)",
          date: "Oct 2025 – Present",
          position: "Senior Full Stack Developer",
          description:
            "Working with the CDT (Credential and Digital Trust) team on the Integrated Identity Services initiative, developing the BCSC app and integrating BC Wallet into the BC Services Card experience for Android and iOS.",
          notes: [
            "Designed and implemented ScreenWrapper, a common Bifold component for consistent screen sizing and layout across bc-wallet",
            "Implemented BCSC account nickname (create, edit, selection) and persistence to the IAS backend",
            "Built verification and onboarding flows: setup steps, resume verification, approval notifications, and device invalidation",
            "Added security method selector with PIN create/update and device permission handling; fixed permission race conditions",
            "Introduced global error handling and consistent alert styling; improved safe area, scroll behavior, and WebView scaling",
            "Added i18n support for all BCSC v4 screens",
            "Improved CI with GitHub Actions for ledgers on PR and SonarCloud integration"
          ],
          technologies: [
            "React Native",
            "TypeScript",
            "GitHub Actions",
            "Jest",
            "Yarn",
            "GitHub/Git"
          ]
        },
        {
          id: "QDTS",
          label: "QDTS",
          title: "Digital Trust Services (QDTS)",
          date: "Oct 2024 – Oct 2025",
          position: "Senior Full Stack Developer",
          description:
            "Internal SaaS development for Quartech: blockchain-based solutions enabling organizations to establish self-sovereign identities and manage digitally verifiable credentials.",
          notes: [
            "Led development of enterprise-scale web applications using React, Node.js, TypeScript, and Kubernetes",
            "Designed and implemented Helm charts and GitHub Actions workflows for five applications in Azure Kubernetes Cluster",
            "Organized the repository by restructuring front-end and back-end components",
            "Created Docker files for development and production environments for all applications",
            "Migrated the API database from AWS DynamoDB to a self-hosted Bitnami MongoDB via Helm chart dependency",
            "Developed full Issuer Demo admin panel for tenant invitations and credential management with Keycloak OIDC",
            "Automated CI/CD pipelines for three repositories and five containers with full CI/CD support"
          ],
          technologies: [
            "Helm",
            "OpenShift",
            "Kubernetes",
            "Azure",
            "TypeScript",
            "Node.js",
            "Docker",
            "GitHub Actions",
            "MongoDB",
            "Keycloak",
            "OAuth2"
          ]
        },
        {
          id: "NERT",
          label: "NERT",
          title: "Northeastern Restoration Tracker (NERT)",
          date: "May 2024 – September 2024",
          position: "Senior Full Stack Developer / QA Specialist",
          description:
            "GIS-based web application supporting restoration efforts across BC's natural resource regions with interactive map features for visualizing and tracking projects.",
          notes: [
            "Provided pivotal support deploying NERT to OpenShift-native environments (DEV/TEST/PROD) using GitOps/IaC practices",
            "Implemented test automation frameworks (unit, integration, end-to-end) using Mocha, Jest, and Cypress",
            "Led development of enterprise-scale web applications using React, Node.js, TypeScript, and OpenShift 4.x",
            "Redesigned RESTful API systems following OpenAPI conventions with layered architecture",
            "Wrote initial database migrations at DEV, TEST, and PROD stages",
            "Designed and optimized PostgreSQL for performance, indexing, query optimization, and schema design",
            "Integrated authentication and verification throughout the project (OAuth)"
          ],
          technologies: [
            "React",
            "Material-UI",
            "Node.js",
            "TypeScript",
            "Git",
            "PostgreSQL",
            "Docker",
            "OpenShift",
            "Mocha",
            "Jest",
            "Cypress",
            "OAuth2"
          ]
        },
        {
          id: "SIMS/BIOHUB",
          label: "SIMS/BIOHUB",
          title: "Species Inventory Management System / BioHub (SIMS/BIOHUB)",
          date: "Dec 2021 – April 2024",
          position: "Senior Full Stack Developer",
          description:
            "Digital transformation initiative centralizing BC's aquatic and terrestrial species and habitat data, integrating multiple legacy systems into a unified platform.",
          notes: [
            "Led development of enterprise-scale web applications using React, Node.js, TypeScript, and OpenShift",
            "Redesigned RESTful API systems following OpenAPI conventions with layered architecture",
            "Wrote database migrations at DEV, TEST, and PROD stages",
            "Developed savers and parsers for CSV, XML, and XLS files",
            "Implemented email and phone notification service (GC Notify)",
            "Created a front-end map using Leaflet",
            "Integrated authentication and verification throughout the project (OAuth)"
          ],
          technologies: [
            "React",
            "Material-UI",
            "Node.js",
            "TypeScript",
            "Git",
            "PostgreSQL",
            "Docker",
            "OpenShift",
            "Mocha",
            "Jest",
            "OAuth2"
          ]
        },
        {
          id: "HRT",
          label: "HRT",
          title: "Habitat Restoration Tracker (HRT)",
          date: "Jan 2023 – April 2023",
          position: "Senior Full Stack Developer",
          description:
            "Platform managing restoration efforts across BC during the foundational development phase.",
          notes: [
            "Assisted in the redesign and integration of the RESTful API system",
            "Implemented test automation frameworks (unit, integration, end-to-end)",
            "Established the initial project setup and development lifecycle",
            "Integrated scientific data for a comprehensive overview of restoration activities"
          ],
          technologies: [
            "React",
            "Material-UI",
            "Node.js",
            "TypeScript",
            "Git",
            "PostgreSQL",
            "Docker",
            "OpenShift",
            "Mocha",
            "Jest"
          ]
        },
        {
          id: "BuyBC",
          label: "BuyBC",
          title: "Investment Agriculture Foundation (BuyBC)",
          date: "Sept 2021 – Dec 2021",
          position: "Full Stack Developer",
          description:
            "Verifiable credential issuance for organizations in OrgBook BC, using the OrgBook DEV API to link BuyBC credentials to BC registration IDs.",
          technologies: ["Vue.js", "Node.js", "TypeScript", "Docker", "Git"],
          notes: [
            "Built and iterated on Vue.js front-end features applying component-based architecture and TypeScript",
            "Implemented a user feedback form and optimized search bar interactions",
            "Assisted in migration to IAF servers, updating Docker configurations and environment variables"
          ]
        }
      ]
    },
    {
      company: "SYNQ Tech",
      title: "Software / Web Developer",
      date: "Jun 2020 – Dec 2020",
      contract: [
        {
          id: "SYNQ",
          label: "SYNQ",
          title: "SYNQ Tech",
          date: "Jun 2020 – Dec 2020",
          position: "Software / Web Developer",
          description:
            "Technology company specializing in real-time integration and analytics solutions for seamless data synchronization across sources.",
          notes: [
            "Designed and updated the company website",
            "Developed and installed network check-in software for company assets and devices",
            "Built a prototype for a remote access locker system — wiring, soldering, and programming the device",
            "Provided technology resolution and in-person tech support for client devices"
          ],
          technologies: [
            "Python",
            "MySQL",
            "HTML",
            "CSS",
            "Network Management",
            "Raspberry Pi Development",
            "Arch Linux"
          ]
        }
      ]
    }
  ]
};
