import React, { useState } from "react";
import { ChevronDown, ChevronUp, RotateCcw, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  defaultJobFilterOptions,
  emptyJobFilterValue,
  type JobFilterOptions,
  type JobFilterOption,
  type JobFilterValue,
} from "./jobFilterConfig";

type JobSearchFiltersProps = {
  options?: Partial<JobFilterOptions>;
  value?: JobFilterValue;
  onChange?: (value: JobFilterValue) => void;
  onReset?: () => void;
};

type SelectFilterProps = {
  label: string;
  value: string;
  options: JobFilterOption[];
  placeholder?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
};

const ALL_VALUE = "__all__";

function SelectFilter({
  label,
  value,
  options,
  placeholder = "Tất cả",
  disabled,
  onChange,
}: SelectFilterProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select
        value={value || ALL_VALUE}
        disabled={disabled}
        onValueChange={(nextValue) => onChange(nextValue === ALL_VALUE ? "" : nextValue)}
      >
        <SelectTrigger className="h-12 bg-white transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            value={ALL_VALUE}
            className="focus:bg-primary focus:text-primary-foreground"
          >
            {placeholder}
          </SelectItem>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
              className="focus:bg-primary focus:text-primary-foreground"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function JobSearchFilters({
  options,
  value,
  onChange,
  onReset,
}: JobSearchFiltersProps) {
  const [internalValue, setInternalValue] = useState<JobFilterValue>(emptyJobFilterValue);
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const filterValue = value ?? internalValue;
  const filterOptions = { ...defaultJobFilterOptions, ...options };

  const updateValue = (field: keyof JobFilterValue, nextValue: string) => {
    const nextFilterValue = { ...filterValue, [field]: nextValue };
    setInternalValue(nextFilterValue);
    onChange?.(nextFilterValue);
  };

  const updateNumericValue = (field: "minOpenings" | "minSalary", nextValue: string) => {
    updateValue(field, nextValue.replace(/\D/g, ""));
  };

  const resetFilters = () => {
    setInternalValue(emptyJobFilterValue);
    onChange?.(emptyJobFilterValue);
    onReset?.();
  };

  return (
    <div className="rounded-lg border bg-white p-5 shadow-sm md:p-6">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-4 text-left"
        onClick={() => setIsFiltersOpen((current) => !current)}
        aria-expanded={isFiltersOpen}
      >
        <span className="flex items-center gap-3">
          <SlidersHorizontal className="h-5 w-5 text-primary" />
          <span className="text-xl font-semibold text-foreground">Bộ lọc tìm kiếm</span>
        </span>
        {isFiltersOpen ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </button>

      {isFiltersOpen && (
        <>
          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="job-keyword-filter">Từ khóa</Label>
              <Input
                id="job-keyword-filter"
                value={filterValue.keyword}
                onChange={(event) => updateValue("keyword", event.target.value)}
                placeholder="Tên việc, tên công ty..."
                className="h-12 bg-white"
              />
            </div>

            <SelectFilter
              label="Tỉnh/Thành phố"
              value={filterValue.city}
              options={filterOptions.cities}
              onChange={(nextValue) => updateValue("city", nextValue)}
            />

            <SelectFilter
              label="Hình thức làm việc"
              value={filterValue.workMode}
              options={filterOptions.workModes}
              onChange={(nextValue) => updateValue("workMode", nextValue)}
            />

            <SelectFilter
              label="Loại công việc"
              value={filterValue.jobType}
              options={filterOptions.jobTypes}
              onChange={(nextValue) => updateValue("jobType", nextValue)}
            />
          </div>

          <button
            type="button"
            className="mt-8 flex w-full items-center justify-between gap-3 text-sm font-semibold text-foreground"
            onClick={() => setIsAdvancedOpen((current) => !current)}
            aria-expanded={isAdvancedOpen}
          >
            <span className="flex items-center gap-3">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              Tìm kiếm nâng cao
            </span>
            {isAdvancedOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          {isAdvancedOpen && (
            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <SelectFilter
                label="Quận/Huyện"
                value={filterValue.district}
                options={filterOptions.districts}
                onChange={(nextValue) => updateValue("district", nextValue)}
              />

              <SelectFilter
                label="Phường/Xã"
                value={filterValue.ward}
                options={filterOptions.wards}
                placeholder="Chọn quận/huyện trước"
                disabled={!filterValue.district && filterOptions.wards.length === 0}
                onChange={(nextValue) => updateValue("ward", nextValue)}
              />

              <SelectFilter
                label="Công ty"
                value={filterValue.company}
                options={filterOptions.companies}
                onChange={(nextValue) => updateValue("company", nextValue)}
              />

              <div className="space-y-2">
                <Label htmlFor="job-min-openings-filter">Số lượng tuyển tối thiểu</Label>
                <Input
                  id="job-min-openings-filter"
                  value={filterValue.minOpenings}
                  onChange={(event) => updateNumericValue("minOpenings", event.target.value)}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="1"
                  className="h-12 bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="job-min-salary-filter">Mức lương tối thiểu</Label>
                <Input
                  id="job-min-salary-filter"
                  value={filterValue.minSalary}
                  onChange={(event) => updateNumericValue("minSalary", event.target.value)}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="0"
                  className="h-12 bg-white"
                />
              </div>

              <SelectFilter
                label="Đơn vị tiền tệ"
                value={filterValue.currency}
                options={filterOptions.currencies}
                onChange={(nextValue) => updateValue("currency", nextValue)}
              />
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <Button type="button" variant="outline" onClick={resetFilters}>
              <RotateCcw className="h-4 w-4" />
              Đặt lại bộ lọc
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
