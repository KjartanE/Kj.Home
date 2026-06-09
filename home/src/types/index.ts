export interface IResume {
  personal: IPersonal;
  highlights: IHighlight[];
  skillGroups: ISkillGroup[];
  education: IEducation[];
  certifications: ICertification[];
  awards: string[];
  creativeProjects: ICreativeProject[];
}

export interface IPersonal {
  name: string;
  title: string;
  email: string;
  description: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
  youtube: string;
}

export interface IHighlight {
  role: string;
  org: string;
  project?: string;
  start: string;
  end: string;
  summary: string;
  bullets?: string[];
  tech: string[];
}

export interface ISkillGroup {
  label: string;
  items: string[];
}

export interface IEducation {
  school: string;
  degree: string;
  date: string;
}

export interface ICertification {
  title: string;
  issuer?: string;
  date?: string;
}

export interface ICreativeProject {
  title: string;
  description: string;
  href?: string;
}
