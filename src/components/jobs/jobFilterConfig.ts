export type JobFilterOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type JobFilterOptions = {
  cities: JobFilterOption[];
  workModes: JobFilterOption[];
  jobTypes: JobFilterOption[];
  districts: JobFilterOption[];
  wards: JobFilterOption[];
  companies: JobFilterOption[];
  currencies: JobFilterOption[];
};

export type JobFilterValue = {
  keyword: string;
  city: string;
  workMode: string;
  jobType: string;
  district: string;
  ward: string;
  company: string;
  minOpenings: string;
  minSalary: string;
  currency: string;
};

export const emptyJobFilterValue: JobFilterValue = {
  keyword: "",
  city: "",
  workMode: "",
  jobType: "",
  district: "",
  ward: "",
  company: "",
  minOpenings: "",
  minSalary: "",
  currency: "",
};

export const defaultJobFilterOptions: JobFilterOptions = {
  cities: [],
  workModes: [],
  jobTypes: [],
  districts: [],
  wards: [],
  companies: [],
  currencies: [],
};
