import { resume } from "./resume.tsx";
import * as React from "react";

import EducationComponent from "./components/EducationComponent.tsx";
import CertComponent from "./components/CertComponent.tsx";
import SkillComponent from "./components/SkillComponent.tsx";
import PersonalComponent from "./components/PersonalComponent.tsx";

export default function AboutPage() {
  return (
    <>
      <div>
        <PersonalComponent personal={resume.personal} />

        <div className="flex flex-col gap-4 pl-64">
          <EducationComponent education={resume.education[0]} />
          <CertComponent certifications={resume.certifications} />

          <SkillComponent title="Skills" skills={resume.skills} />
          <SkillComponent title="Technologies" skills={resume.technologies} />
          <SkillComponent title="Languages" skills={resume.languages} />
          <h2 className="mb-4 text-lg font-semibold tracking-tighter">Work Experience</h2>
        </div>
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
    </>
  );
}
