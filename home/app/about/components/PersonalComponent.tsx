import React from "react";
import { IPersonal } from "../resume";
import { Link } from "@nextui-org/link";
import { GithubIcon, LinkedInIcon, YouTubeIcon } from "@/components/icons";

export interface IPersonalComponent {
  personal: IPersonal;
}

const PersonalComponent: React.FC<IPersonalComponent> = (props) => {
  const { name, email, phone, description, location, linkedin, github, youtube } = props.personal;

  return (
    <div className="sticky top-32 flex-shrink">
      <div className="flex-shrink gap-3">
        <h1>{name}</h1>
        <p>{email}</p>
        <p>{phone}</p>
        <p>{description}</p>
        <p>{location}</p>
        <Link isExternal aria-label="Github" href={github}>
          <GithubIcon className="text-default-500" />
        </Link>
        <Link isExternal aria-label="Youtube" href={youtube}>
          <YouTubeIcon className="text-default-500" />
        </Link>
        <Link isExternal aria-label="Linkedin" href={linkedin}>
          <LinkedInIcon className="text-default-500" />
        </Link>
      </div>
    </div>
  );
};

export default PersonalComponent;
