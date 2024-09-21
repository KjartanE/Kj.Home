import { resume } from "./resume.tsx"
export default function Page() {
  const formatEducation = (education) => {
    return `${education.school} | ${education.degree} | ${education.major} | ${education.graduation}`
  }

  return (
    <>
      <div style={{ position: "absolute", top: "10vh", left: "4vw" }}>
        <h1 className="mb-8 text-2xl font-semibold tracking-tighter">
          Kjartan Einarsson
        </h1>
        <p className="mb-8 text-sm text-gray-500">
          kjartanreinarsson@gmail.com
        </p>
        <p className="mb-8 text-sm text-gray-500">250-507-0444</p>
        <p className="mb-8 text-sm text-gray-500">Victoria, BC</p>
        <a href={"https://www.linkedin.com/in/kjartan-einarsson-05184719a/"}>
          <p className="mb-8 text-sm text-gray-500">Linkedin</p>
        </a>
        <a href={"https://github.com/KjartanE"}>
          <p className="mb-8 text-sm text-gray-500">Github</p>
        </a>
      </div>

      <div className="grid grid-cols-1 gap-4 grid-flow-col auto-cols-max">
        <div>
          <div className="flex flex-col items-center justify-center">
            <h2 className="mb-4 text-lg font-semibold tracking-tighter">
              About Me
            </h2>

            <div className="grid grid-cols-3 gap-4 grid-flow-col auto-cols-max">
              <div>
                <h2 className="mb-4 text-lg font-semibold tracking-tighter">
                  Skills
                </h2>
                <ul className="mb-8">
                  {resume.skills.map((skill) => (
                    <li key={skill} className="list-disc ml-4">
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="mb-4 text-lg font-semibold tracking-tighter">
                  Technologies
                </h2>
                <ul className="mb-8">
                  {resume.technologies.map((technology) => (
                    <li key={technology} className="list-disc ml-4">
                      {technology}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="mb-4 text-lg font-semibold tracking-tighter">
                  Languages
                </h2>
                <ul className="mb-8">
                  {resume.languages.map((language) => (
                    <li key={language} className="list-disc ml-4">
                      {language}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <h2 className="mb-4 text-lg font-semibold tracking-tighter">
              Education
            </h2>
            <p className="mb-8">{formatEducation(resume.education[0])}</p>
            <h2 className="mb-4 text-lg font-semibold tracking-tighter">
              Certifications
            </h2>
            <ul className="mb-8">
              {resume.certifications.map((certification) => (
                <li key={certification.title} className="list-disc ml-4">
                  {certification.title}
                  {certification.date}
                </li>
              ))}
            </ul>
            <h2 className="mb-4 text-lg font-semibold tracking-tighter">
              Work Experience
            </h2>
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
        </div>
      </div>
    </>
  )
}
