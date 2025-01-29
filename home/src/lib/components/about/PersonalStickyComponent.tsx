import { GithubIcon, LinkedinIcon, YoutubeIcon } from "@/src/lib/assets/svg";
import { IPersonalStickyComponent } from "@/src/lib/interfaces/about";
import Link from "next/link";
import React from "react";



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
          {GithubIcon}
        </Link>
        <Link aria-label="Youtube" href={youtube}>
          {YoutubeIcon}
        </Link>
        <Link aria-label="Linkedin" href={linkedin}>
          {LinkedinIcon}
        </Link>
      </div>
    </>
  );
};

export default PersonalStickyComponent;
