import { resume } from "./resume.tsx";
import * as React from "react";

import SkillComponent from "./components/SkillComponent.tsx";
import IntroductionComponent from "./components/IntroductionComponent.tsx";
import PersonalStickyComponent from "./components/PersonalStickyComponent.tsx";

export default function AboutPage() {
  return (
    <div className="flex">
      <PersonalStickyComponent personal={resume.personal} />
      <div className="flex flex-col gap-4 px-8">
        <IntroductionComponent />


        <div className="flex justify-center gap-4">
          <SkillComponent title="Skills" skills={resume.skills} />
          <SkillComponent title="Technologies" skills={resume.technologies} />
          <SkillComponent title="Languages" skills={resume.languages} />
        </div>
        <h2 className="mb-4 text-lg font-semibold tracking-tighter">Work Experience</h2>
      </div>
      {/* <ul className="mb-8">
            {resume.work_experience.map((workExperience) => (
              <li key={workExperience.company} className="list-disc ml-4">
                {workExperience.company}
                {workExperience.title}
                {workExperience.date}
                {workExperience.contract.map((contract) => (
                  <li key={contract.title} className="list-disc ml-4">
                    {contract.title}
                    {contract.date}
                    {contract.position}
                    {contract.description}
                    {contract.notes &&
                      contract.notes.map((note) => (
                        <li key={note} className="list-disc ml-4">
                          {note}
                        </li>
                      ))}
                    {contract.technologies.map((technology) => (
                      <li key={technology} className="list-disc ml-4">
                        {technology}
                      </li>
                    ))}
                  </li>
                ))}
              </li>
            ))}
          </ul> */}
    </div>
  );
}
