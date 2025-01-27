import React from "react";
import { IPersonal } from "../../../../public/config/resume";
import { Link } from "@nextui-org/link";
import { GithubIcon, LinkedInIcon, YouTubeIcon } from "@/src/components/icons";

export interface IPersonalStickyComponent {
  personal: IPersonal;
  onClick?: () => void;
}

const PersonalStickyComponent: React.FC<IPersonalStickyComponent> = (props) => {
  const { name, email, phone, description, location, linkedin, github, youtube } = props.personal;

  return (
    <>
      <h1>{name}</h1>
      <p>{email}</p>
      <p>{phone}</p>
      <p>{description}</p>
      <p>{location}</p>
      <div className="flex flex-row gap-3">
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
    </>
  );
};

export default PersonalStickyComponent;
