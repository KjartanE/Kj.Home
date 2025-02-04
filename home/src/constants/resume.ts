import { IResume } from "@/types";

export const resume: IResume = {
  personal: {
    name: "Kjartan Einarsson",
    email: "kjartanreinarsson@gmail.com",
    phone: "250-507-0444",
    description: "I like coding.",
    location: "Victoria, BC",
    linkedin: "https://www.linkedin.com/in/kjartan-einarsson-05184719a/",
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
    "Soldering and Wiring Hardware",
    "Communication",
    "Raspberry Pi Development",
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
    "React Native",
    "Vue.js",
    "Next.js",
    "Node.js",
    "Express",
    "Flask",
    "FastAPI",
    "Django",
    "Material-UI",
    "Next-UI",
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
    "Portainer",
    "Adguard"
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
    "Cypress",
    "JMeter",
    "Playwright"
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
      graduation: "June 2024-August 2024",
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
      title: "Intermediate Technical Architect",
      date: "2021-Present",
      contract: [
        {
          id: "QTS",
          label: "QTS",
          title: "Quartech Trust Services",
          date: "2021-Present",
          position: "Intermediate Technical Architect",
          description: "Developed and maintained Quartech Trust Services' web applications.",
          notes: [
            "Architected and developed digital wallet solutions for credential management",
            "Implemented secure authentication using Keycloak integration",
            "Built mobile-responsive web applications with React Native",
            "Designed and implemented RESTful APIs for wallet management",
            "Integrated with Hyperledger Aries and Traction for credential issuance",
            "Set up containerized development environments using Docker and Kubernetes",
            "Managed deployments across Azure and OpenShift platforms",
            "Implemented CI/CD pipelines using GitHub Actions",
            "Created comprehensive documentation for onboarding and setup processes"
          ],
          technologies: [
            "React",
            "React Native",
            "NodeJS",
            "TypeScript",
            "Caddy",
            "Yarn",
            "Keycloak",
            "MariaDB",
            "MongoDB",
            "Docker",
            "Kubernetes",
            "Helm",
            "Azure",
            "GitHub Actions",
            "GitHub/Git",
            "OpenShift",
            "Hyperledger Aries",
            "ACA-Py",
            "Traction"
          ]
        },
        {
          id: "NERT",
          label: "NERT",
          title: "Northeastern Restoration Tracker (NERT)",
          date: "May 2024 - September 2024",
          position: "QA Tester / Full Stack Developer",
          description: "Developed testing frameworks and assisted in deployment.",
          notes: [
            "Wrote unit test cases (Mocha, Jest, Cypress).",
            "Redesigned API systems for streamlined structure.",
            "Wrote database migrations.",
            "Modified scripts and ENV variables for DevOps.",
            "Integrated authentication (OAuth).",
            "Used token validation for user authentication.",
            "Created DB seed files and backup scripts.",
            "Handled error control and form validation (Formik).",
            "Managed development and migration stages."
          ],
          technologies: [
            "React",
            "Material-UI",
            "NodeJS",
            "TypeScript",
            "Git",
            "PostgreSQL",
            "Docker",
            "OpenShift",
            "Mocha",
            "Jest",
            "Cypress",
            "OAuth",
            "Formik"
          ]
        },
        {
          id: "SIMS/BIOHUB",
          label: "SIMS/BIOHUB",
          title: "Species Inventory Management System / BioHub (SIMS/BIOHUB)",
          date: "Dec 2021 - April 2024",
          position: "Full Stack Developer",
          description: "Developed SIMS and BIOHUB functionalities.",
          notes: [
            "Redesigned API systems.",
            "Wrote database migrations.",
            "Modified scripts and ENV variables for DevOps.",
            "Wrote unit test cases (Mocha, Jest).",
            "Handled CSV, XML, and XLS file parsing.",
            "Integrated authentication (OAuth).",
            "Used token validation for user authentication.",
            "Implemented email and phone notifications (GCNotify).",
            "Created DB seed files and backup scripts.",
            "Handled error control and form validation (Formik).",
            "Managed development and migration stages.",
            "Implemented front-end map (Leaflet)."
          ],
          technologies: [
            "React",
            "Material-UI",
            "TypeScript",
            "Git",
            "PostgreSQL",
            "Docker",
            "OpenShift",
            "Mocha",
            "Jest",
            "OAuth",
            "Formik"
          ]
        },
        {
          id: "HRT",
          label: "HRT",
          title: "Habitat Restoration Tracker (HRT)",
          date: "Jan 2023 - April 2023",
          position: "Junior Full Stack Developer",
          description: "Contributed to foundational development of HRT.",
          notes: [
            "Redesigned and integrated RESTful API system.",
            "Formulated testing frameworks.",
            "Contributed to project setup and lifecycle.",
            "Integrated scientific data for restoration activities."
          ],
          technologies: [
            "React",
            "Material-UI",
            "NodeJS",
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
          date: "Sept 2021 - Dec 2021",
          position: "Junior Web Developer",
          description: "Developed front-end updates for BuyBC applications.",
          technologies: ["Vue.JS", "NodeJS", "TypeScript", "Docker", "Git"],
          notes: ["Implemented user feedback form.", "Optimized search bar.", "Improved user interface."]
        }
      ]
    },
    {
      company: "SYNQ Tech",
      title: "Software/ Web Developer",
      date: "Jun 2020 - Dec 2020",
      contract: [
        {
          id: "NERT",
          label: "NERT",
          title: "Northeastern Restoration Tracker (NERT)",
          date: "May 2024 - September 2024",
          position: "QA Tester / Full Stack Developer",
          description: "",
          notes: [
            "Developed network check-in software.",
            "Prototyped remote access locker system.",
            "Provided tech support to clients."
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
