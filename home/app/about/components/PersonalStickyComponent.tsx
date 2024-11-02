import React from "react";
import { IPersonal } from "../resume";
import { Link } from "@nextui-org/link";
import { GithubIcon, LinkedInIcon, YouTubeIcon } from "@/components/icons";
import { Card } from "@nextui-org/react";

export interface IPersonalStickyComponent {
  personal: IPersonal;
}

const PersonalStickyComponent: React.FC<IPersonalStickyComponent> = (props) => {
  const { name, email, phone, description, location, linkedin, github, youtube } = props.personal;

  return (
    <div className="sticky top-0 h-svh py-32">
      <Card className="flex-shrink gap-3 p-6 bg-zinc-950">
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
    </div>
  );
};

export default PersonalStickyComponent;
