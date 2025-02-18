export interface IResume {
  personal: IPersonal;
  skills: string[];
  technologies: string[];
  languages: string[];
  education: IEducation[];
  certifications: ICertification[];
  work_experience: IWorkExperience[];
}

export interface IPersonal {
  name: string;
  email: string;
  phone: string;
  description: string;
  location: string;
  linkedin: string;
  github: string;
  youtube: string;
}

export interface ICertification {
  title: string;
  short: string;
  date: string;
  description: string;
  logo: string;
}

export interface IEducation {
  title: string;
  school: string;
  degree: string;
  major: string;
  graduation: string;
  logo: string;
}

export interface IWorkExperience {
  company: string;
  title: string;
  date: string;
  contract: IContract[];
}

export interface IContract {
  id: string;
  label: string;
  title: string;
  date: string;
  position: string;
  description: string;
  notes?: string[];
  technologies: string[];
}

export interface ICertComponent {
  certifications: ICertification[];
}

export interface IEducationComponent {
  education: IEducation[];
}

export interface IPersonalStickyComponent {
  personal: IPersonal;
  onClick?: () => void;
}

export interface IContractData {
  contract: IContract;
}
