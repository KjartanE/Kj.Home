import { Award, GraduationCap, Medal } from "lucide-react";
import type { ICertification, IEducation } from "@/types";

interface EducationCertsProps {
  education: IEducation[];
  certifications: ICertification[];
  awards: string[];
}

export default function EducationCerts({ education, certifications, awards }: EducationCertsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-xl surface-solid p-4">
        <h3 className="flex items-center gap-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          <GraduationCap className="h-4 w-4" /> Education
        </h3>
        {education.map((e) => (
          <div key={e.degree} className="mt-3">
            <p className="text-sm font-medium">{e.degree}</p>
            <p className="text-sm text-muted-foreground">
              {e.school} · {e.date}
            </p>
          </div>
        ))}
        <h3 className="mt-5 flex items-center gap-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          <Medal className="h-4 w-4" /> Awards
        </h3>
        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
          {awards.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </div>
      <div className="rounded-xl surface-solid p-4">
        <h3 className="flex items-center gap-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          <Award className="h-4 w-4" /> Certifications
        </h3>
        <ul className="mt-3 space-y-2">
          {certifications.map((c) => (
            <li key={c.title}>
              <p className="text-sm font-medium">{c.title}</p>
              {(c.issuer || c.date) && (
                <p className="text-sm text-muted-foreground">{[c.issuer, c.date].filter(Boolean).join(" · ")}</p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
