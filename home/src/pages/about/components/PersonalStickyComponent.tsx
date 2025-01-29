import { IPersonal } from "@/public/config/resume";
import { Icons } from "@/src/lib/components/icons";
import { Link } from "lucide-react";
import React from "react";


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
        <Link aria-label="Github" href={github}>
          {Icons.info.GitHubIcon}
        </Link>
        <Link aria-label="Youtube" href={youtube}>
          {Icons.info.YoutubeIcon}
        </Link>
        <Link aria-label="Linkedin" href={linkedin}>
          {Icons.info.LinkedInIcon}s
        </Link>
      </div>
    </>
  );
};

export default PersonalStickyComponent;
