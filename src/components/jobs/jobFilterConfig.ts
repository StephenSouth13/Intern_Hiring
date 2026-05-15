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
  cities: [
    { value: "ho-chi-minh", label: "Hồ Chí Minh" },
    { value: "ha-noi", label: "Hà Nội" },
    { value: "da-nang", label: "Đà Nẵng" },
    { value: "remote", label: "Remote" },
  ],
  workModes: [
    { value: "onsite", label: "Làm việc tại văn phòng" },
    { value: "hybrid", label: "Hybrid" },
    { value: "remote", label: "Remote" },
  ],
  jobTypes: [
    { value: "internship", label: "Thực tập" },
    { value: "part-time", label: "Part-time" },
    { value: "full-time", label: "Full-time" },
  ],
  districts: [
    { value: "quan-1", label: "Quận 1" },
    { value: "quan-3", label: "Quận 3" },
    { value: "thu-duc", label: "Thành phố Thủ Đức" },
  ],
  wards: [],
  companies: [
    { value: "asl", label: "ASL" },
    { value: "binemo", label: "Binemo" },
    { value: "cp-group", label: "CP Group" },
  ],
  currencies: [
    { value: "vnd", label: "VND" },
    { value: "usd", label: "USD" },
  ],
};
