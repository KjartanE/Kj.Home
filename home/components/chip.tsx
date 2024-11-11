import React from "react";
import {
  FaDatabase,
  FaCode,
  FaNetworkWired,
  FaMicrochip,
  FaUsers,
  FaServer,
  FaLaptopCode,
  FaCogs,
  FaMap,
  FaDocker,
  FaReact,
  FaNodeJs,
  FaJava,
  FaPython,
  FaJsSquare,
  FaCss3Alt,
  FaHtml5,
  FaTerminal,
  FaVial
} from "react-icons/fa";

interface ChipProps {
  label: string;
  color: string;
  icon: React.ReactNode;
}

const Chip: React.FC<ChipProps> = ({ label, color, icon }) => {
  const chipStyle = {
    display: "flex",
    alignItems: "center",
    backgroundColor: color,
    padding: "0.5em 1em",
    borderRadius: "16px",
    color: "#fff",
    fontWeight: "bold",
    fontSize: "0.875em"
  };

  const iconStyle = {
    marginRight: "0.5em"
  };

  return (
    <div style={chipStyle}>
      <span style={iconStyle}>{icon}</span>
      {label}
    </div>
  );
};

export default Chip;

export const ChipList = ({ chips }: { chips: ChipProps[] }) => {
  return (
    <>
      {chips.map((chip, index) => (
        <span key={index} style={{ padding: "5px", borderRadius: "5px", margin: "5px" }}>
          <Chip {...chip} />
        </span>
      ))}
    </>
  );
};

export const findChip = (data: string) => {
  if (skillDetails[data as Skill]) {
    return { label: data, ...skillDetails[data as Skill] };
  } else if (technologyDetails[data as Technology]) {
    return { label: data, ...technologyDetails[data as Technology] };
  } else if (languageDetails[data as Language]) {
    return { label: data, ...languageDetails[data as Language] };
  } else {
    return { label: "", color: "", icon: undefined as any };
  }
};

export const sortChips = (data: string[]) => {
  const list: ChipProps[] = [];

  data.forEach((value) => {
    const chip = findChip(value);

    if (chip.label.length > 0) {
      list.push(chip);
    }
  });

  return list;
};

export enum Skill {
  Web_Design = "Web Design",
  Data_Structures = "Data Structures",
  Database_Management = "Database Management",
  Agile_Development = "Agile Development",
  Soldering_and_Wiring_Hardware = "Soldering and Wiring Hardware",
  Communication = "Communication",
  Network_Management = "Network Management",
  Raspberry_Pi_Development = "Raspberry Pi Development",
  Teamwork = "Teamwork"
}

export enum Technology {
  OpenShift = "OpenShift",
  Linux = "Linux",
  GitHub_Git = "GitHub/Git",
  GitHub_Actions_DevOps = "GitHub Actions / DevOps",
  GIS_Leaflet = "GIS Leaflet",
  Docker = "Docker",
  React = "React",
  NodeJS = "NodeJS",
  MongoDB = "MongoDB",
  Cypress = "Cypress",
  REST_API = "REST API"
}

export enum Language {
  Java = "Java",
  Python = "Python",
  C_CPP = "C/C++",
  JavaScript_TypeScript = "JavaScript/TypeScript",
  MySQL = "MySQL",
  PostgreSQL = "PostgreSQL",
  CSS = "CSS",
  HTML = "HTML",
  Bash = "Bash",
  Mocha_Jest_Selenium = "Mocha/Jest/Selenium"
}

export const skillDetails = {
  [Skill.Web_Design]: { color: "#2EB84C", icon: <FaLaptopCode /> },
  [Skill.Data_Structures]: { color: "#2B4EB8", icon: <FaDatabase /> },
  [Skill.Database_Management]: { color: "#B82E8C", icon: <FaDatabase /> },
  [Skill.Agile_Development]: { color: "#2EB8D4", icon: <FaCogs /> },
  [Skill.Soldering_and_Wiring_Hardware]: { color: "#B84C2E", icon: <FaMicrochip /> },
  [Skill.Communication]: { color: "#2EB84C", icon: <FaUsers /> },
  [Skill.Network_Management]: { color: "#2B4EB8", icon: <FaNetworkWired /> },
  [Skill.Raspberry_Pi_Development]: { color: "#B82E8C", icon: <FaMicrochip /> },
  [Skill.Teamwork]: { color: "#2EB8D4", icon: <FaUsers /> }
};

export const technologyDetails = {
  [Technology.OpenShift]: { color: "#B84C2E", icon: <FaServer /> },
  [Technology.Linux]: { color: "#2EB84C", icon: <FaLaptopCode /> },
  [Technology.GitHub_Git]: { color: "#2B4EB8", icon: <FaCode /> },
  [Technology.GitHub_Actions_DevOps]: { color: "#B82E8C", icon: <FaCogs /> },
  [Technology.GIS_Leaflet]: { color: "#2EB8D4", icon: <FaMap /> },
  [Technology.Docker]: { color: "#B84C2E", icon: <FaDocker /> },
  [Technology.React]: { color: "#2EB84C", icon: <FaReact /> },
  [Technology.NodeJS]: { color: "#2B4EB8", icon: <FaNodeJs /> },
  [Technology.MongoDB]: { color: "#B82E8C", icon: <FaDatabase /> },
  [Technology.Cypress]: { color: "#2EB8D4", icon: <FaCogs /> },
  [Technology.REST_API]: { color: "#B84C2E", icon: <FaServer /> }
};

export const languageDetails = {
  [Language.Java]: { color: "#B84C2E", icon: <FaJava /> },
  [Language.Python]: { color: "#2EB84C", icon: <FaPython /> },
  [Language.C_CPP]: { color: "#2B4EB8", icon: <FaCode /> },
  [Language.JavaScript_TypeScript]: { color: "#B82E8C", icon: <FaJsSquare /> },
  [Language.MySQL]: { color: "#2EB8D4", icon: <FaDatabase /> },
  [Language.PostgreSQL]: { color: "#B84C2E", icon: <FaDatabase /> },
  [Language.CSS]: { color: "#2EB84C", icon: <FaCss3Alt /> },
  [Language.HTML]: { color: "#2B4EB8", icon: <FaHtml5 /> },
  [Language.Bash]: { color: "#B82E8C", icon: <FaTerminal /> },
  [Language.Mocha_Jest_Selenium]: { color: "#2EB8D4", icon: <FaVial /> }
};
