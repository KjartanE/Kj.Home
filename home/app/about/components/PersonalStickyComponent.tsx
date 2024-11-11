import React from "react";
import { IPersonal } from "../resume";
import { Link } from "@nextui-org/link";
import { GithubIcon, LinkedInIcon, YouTubeIcon } from "@/components/icons";
import { Card } from "@nextui-org/react";

export interface IPersonalStickyComponent {
  personal: IPersonal;
  onClick?: () => void;
}

const PersonalStickyComponent: React.FC<IPersonalStickyComponent> = (props) => {
  const { name, email, phone, description, location, linkedin, github, youtube } = props.personal;

  return (
    <Card className="flex-shrink gap-3 p-6">
      <button className="absolute right-2 top-2 text-gray-500" onClick={props.onClick}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="h-6 w-6">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
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
    </Card>
  );
};

export default PersonalStickyComponent;
