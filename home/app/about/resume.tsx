export interface IResume {
  personal: IPersonal;
  skills: string[];
  technologies: string[];
  languages: string[];
  education: IEducation[];
  certifications: ICertification[];
  work_experience: IWorkExperience[];
}

export interface IPersonal {
  name: string;
  email: string;
  phone: string;
  description: string;
  location: string;
  linkedin: string;
  github: string;
  youtube: string;
}

export interface ICertification {
  title: string;
  short: string;
  date: string;
  description: string;
  logo: string;
}

export interface IEducation {
  school: string;
  degree: string;
  major: string;
  graduation: string;
}

export interface IWorkExperience {
  company: string;
  title: string;
  date: string;
  contract: IContract[];
}

export interface IContract {
  title: string;
  date: string;
  position: string;
  description: string;
  notes?: string[];
  technologies: string[];
}

export const resume: IResume = {
  personal: {
    name: "Kjartan Einarsson",
    email: "kjartanreinarsson@gmail.com",
    phone: "250-507-0444",
    description: "I like coding.",
    location: "Victoria, BC",
    linkedin: "https://www.linkedin.com/in/kjartan-einarsson-05184719a/",
    github: "https://github.com/KjartanE",
    youtube: "https://www.youtube.com/@kjartan6030"
  },
  skills: [
    "REST API",
    "Web Design",
    "Data Structures",
    "Database Management",
    "Agile Development",
    "Soldering and Wiring Hardware",
    "Communication",
    "Network Management",
    "Raspberry Pi Development",
    "Teamwork"
  ],
  technologies: [
    "OpenShift",
    "Linux",
    "GitHub/Git",
    "GitHub Actions / DevOps",
    "GIS Leaflet",
    "Docker",
    "React",
    "NodeJS",
    "MongoDB",
    "Cypress"
  ],
  languages: [
    "Java",
    "Python",
    "C/C++",
    "JavaScript/TypeScript",
    "MySQL",
    "PostgreSQL",
    "CSS",
    "HTML",
    "Bash",
    "Mocha/Jest/Selenium"
  ],
  education: [
    {
      school: "University of Victoria",
      degree: "Bachelor of Software Engineering",
      major: "Software Engineering",
      graduation: "2024"
    }
  ],
  certifications: [
    {
      title: "AWS Certified Cloud Practitioner",
      short: "AWS",
      date: "June 2024",
      description:
        "AWS Certified Cloud Practitioner is an entry-level certification that provides a foundational understanding of AWS cloud services.",
      logo: "./aws.png"
    },
    {
      title: "B.C. Government, OpenShift 101",
      short: "OpenShift",
      date: "June 2024",
      description:
        "OpenShift 101 is a course that provides an introduction to OpenShift, a container orchestration platform that allows for the deployment of containerized applications.",
      logo: "./openshift.png"
    },
    {
      title: "B.C. Government, OpenShift 201",
      short: "OpenShift",
      date: "August 2024",
      description:
        "OpenShift 201 is a course that provides an intermediate understanding of OpenShift, focusing on the deployment and management of containerized applications.",
      logo: "./openshift.png"
    }
  ],
  work_experience: [
    {
      company: "Quartech Systems Ltd",
      title: "Full Stack Developer",
      date: "2021-Present",
      contract: [
        {
          title: "Northeastern Restoration Tracker (NERT)",
          date: "May 2024 - September 2024",
          position: "QA Tester / Full Stack Developer",
          description:
            "Kjartan worked as a Quality Assurance Tester and Full stack Developer on the NERT project. Assisting in the development of testing frameworks for each API and APP applications. Kjartan also provided pivotal assistance in the development and deployment of the NERT application to the OpenShift environments (DEV/TEST/PROD). Some of the main technologies and infrastructures used in development.",
          notes: [
            "Writing entire API, frontend, and backend unit test cases (Mocha, Jest, Cypress)",
            "Redesigning API systems with layers for endpoints, services, and repositories to adhere to a more streamlined structure. ",
            "Writing initial database migrations at the DEV, TEST, and PROD stages of development.",
            "Modifying scripts, YAMLs, and ENV variables for DEVOPs (OpenShift)",
            "Integrating authentication and verification throughout the project (OAuth)",
            "Use token validation to preserve user authentication.",
            "DB Seed files - Insert, update, patch, and delete queries for any kind of data in PostgreSQL.",
            "DB backup containers and scripts",
            "Error control and front-end form validation (Formik)",
            "Development and migration from TEST-PROD and DEV-TEST"
          ],
          technologies: [
            "React / Material-UI",
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
          title: "Species Inventory Management System / BioHub (SIMS/BIOHUB)",
          date: "Dec 2021 - April 2024",
          position: "Full Stack Developer",
          description:
            "Kjartan worked as a full stack developer during the development of SIMS and BIOHUB. Designing and implementing a variety of languages and frameworks to build the necessary functionalities on the SIMS platform. Some of these technologies and frameworks were.",
          notes: [
            "Redesigning API systems with layers for endpoints, services, and repositories to adhere to a more streamlined structure. ",
            "Writing database migrations at the DEV, TEST, and PROD stages of development.",
            "Modifying scripts, YAMLs, and ENV variables for DEVOPs (OpenShift)",
            "Writing entire API, frontend, and backend unit test cases (Mocha, Jest)",
            "Write savers and parsers for CSV, XML, and XLS files.",
            "Integrating authentication and verification throughout the project (OAuth)",
            "Use token validation to preserve user authentication.",
            "The email and phone notification app (GCNotify)",
            "DB Seed files - Insert, update, patch, and delete queries for any kind of data in PostgreSQL.",
            "DB backup containers and scripts",
            "Error control and front-end form validation (Formik)",
            "Development and migration from TEST-PROD and DEV-TEST",
            "Implementation of front-end map (Leaflet)"
          ],
          technologies: [
            "React / Material-UI",
            "NodeJS",
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
          title: "Habitat Restoration Tracker (HRT)",
          date: "Jan 2023 - April 2023",
          position: "Junior Full Stack Developer",
          description:
            "Kjartan served as a Junior Full Stack Developer during the foundational development phase of the Habitat Restoration Tracker (HRT), a critical platform aimed at managing restoration efforts across the province. He played a pivotal role in the redesign and integration of the RESTful API system and the formulation of backend and frontend testing frameworks. His contributions were essential in establishing the initial project setup and development lifecycle, ensuring a robust integration of scientific data to deliver a transparent and comprehensive overview of land-based restoration activities.",
          technologies: [
            "React / Material-UI",
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
          title: "Investment Agriculture Foundation (BuyBC)",
          date: "Sept 2021 - Dec 2021",
          position: "Junior Web Developer",
          description:
            "Kjartan was responsible for the development of front-end updates to the user interface of the BuyBC issuer and verifier applications. His responsibilities included implementation of a user feedback form, search bar optimization, webpage quality of life changes, and assisting in the migration of the BuyBC application to IAF servers.",
          technologies: ["Vue.JS", "NodeJS", "TypeScript", "Docker", "Git"]
        }
      ]
    },

    {
      company: "SYNQ Tech",
      title: "Software/ Web Developer",
      date: "Jun 2020 - Dec 2020",
      contract: [
        {
          title: "Northeastern Restoration Tracker (NERT)",
          date: "May 2024 - September 2024",
          position: "QA Tester / Full Stack Developer",
          description: "",
          notes: [
            "Developed and installed network check-in software for company assets and devices.",
            "Developed prototype for a remote access locker system, wiring, soldering, and programming the device.",
            "Provided technology resolution to clients through verbal direction and support.",
            "Provided in person tech support for client's devices and assets."
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
