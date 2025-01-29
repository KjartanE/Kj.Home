import { ICertification, IContract, IEducation, IPersonal } from "@/public/config/resume";

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
