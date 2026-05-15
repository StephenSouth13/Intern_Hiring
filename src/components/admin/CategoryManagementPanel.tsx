import React, { useState } from "react";
import { Building2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  createOptionValue,
  filterCategoryLabels,
  type EmployerVerificationField,
  type FilterCategoryKey,
  type ManagedPartner,
  type ManagedSiteConfig,
} from "@/lib/siteConfig";

type CategoryManagementPanelProps = {
  config: ManagedSiteConfig;
  onSave: (config: ManagedSiteConfig) => Promise<void> | void;
  saving?: boolean;
};

const filterCategories = Object.keys(filterCategoryLabels) as FilterCategoryKey[];

const emptyPartnerDraft = {
  name: "",
  logo: "",
};

const emptyFieldDraft: Omit<EmployerVerificationField, "id"> = {
  name: "",
  label: "",
  type: "text",
  placeholder: "",
  required: true,
};

export function CategoryManagementPanel({ config, onSave, saving }: CategoryManagementPanelProps) {
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<FilterCategoryKey>("cities");
  const [filterLabel, setFilterLabel] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [partnerDraft, setPartnerDraft] = useState(emptyPartnerDraft);
  const [fieldDraft, setFieldDraft] = useState(emptyFieldDraft);

  const persist = async (nextConfig: ManagedSiteConfig, successMessage: string) => {
    await onSave(nextConfig);
    toast.success(successMessage);
  };

  const addFilterOption = async () => {
    const label = filterLabel.trim();
    const value = (filterValue.trim() || createOptionValue(label)).trim();

    if (!label || !value) {
      toast.error("Vui lòng nhập tên danh mục.");
      return;
    }

    const currentOptions = config.filters[selectedFilterCategory];
    if (currentOptions.some((option) => option.value === value)) {
      toast.error("Giá trị danh mục đã tồn tại.");
      return;
    }

    await persist(
      {
        ...config,
        filters: {
          ...config.filters,
          [selectedFilterCategory]: [...currentOptions, { label, value }],
        },
      },
      "Đã thêm danh mục.",
    );

    setFilterLabel("");
    setFilterValue("");
  };

  const deleteFilterOption = async (category: FilterCategoryKey, value: string) => {
    await persist(
      {
        ...config,
        filters: {
          ...config.filters,
          [category]: config.filters[category].filter((option) => option.value !== value),
        },
      },
      "Đã xóa danh mục.",
    );
  };

  const addPartner = async () => {
    const name = partnerDraft.name.trim();
    const logo = partnerDraft.logo.trim();

    if (!name || !logo) {
      toast.error("Vui lòng nhập tên đối tác và đường dẫn logo.");
      return;
    }

    const partner: ManagedPartner = {
      id: `${createOptionValue(name)}-${Date.now()}`,
      name,
      logo,
    };

    await persist({ ...config, partners: [...config.partners, partner] }, "Đã thêm đối tác.");
    setPartnerDraft(emptyPartnerDraft);
  };

  const deletePartner = async (partnerId: string) => {
    await persist(
      { ...config, partners: config.partners.filter((partner) => partner.id !== partnerId) },
      "Đã xóa đối tác.",
    );
  };

  const addVerificationField = async () => {
    const label = fieldDraft.label.trim();
    const name = (fieldDraft.name.trim() || createOptionValue(label)).trim();

    if (!label || !name) {
      toast.error("Vui lòng nhập nhãn trường.");
      return;
    }

    if (config.employerVerificationFields.some((field) => field.name === name)) {
      toast.error("Tên trường đã tồn tại.");
      return;
    }

    await persist(
      {
        ...config,
        employerVerificationFields: [
          ...config.employerVerificationFields,
          {
            ...fieldDraft,
            id: `${name}-${Date.now()}`,
            name,
            label,
            placeholder: fieldDraft.placeholder?.trim(),
          },
        ],
      },
      "Đã thêm trường form.",
    );

    setFieldDraft(emptyFieldDraft);
  };

  const deleteVerificationField = async (fieldId: string) => {
    await persist(
      {
        ...config,
        employerVerificationFields: config.employerVerificationFields.filter((field) => field.id !== fieldId),
      },
      "Đã xóa trường form.",
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quản lý danh mục</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="filters">
          <TabsList className="mb-4">
            <TabsTrigger value="filters">Bộ lọc tìm kiếm</TabsTrigger>
            <TabsTrigger value="partners">Đối tác & Tập đoàn</TabsTrigger>
            <TabsTrigger value="verification">Form xác thực</TabsTrigger>
          </TabsList>

          <TabsContent value="filters" className="space-y-5">
            <div className="grid gap-3 md:grid-cols-[220px_1fr_1fr_auto]">
              <div className="space-y-2">
                <Label>Nhóm danh mục</Label>
                <select
                  value={selectedFilterCategory}
                  onChange={(event) => setSelectedFilterCategory(event.target.value as FilterCategoryKey)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {filterCategories.map((category) => (
                    <option key={category} value={category}>
                      {filterCategoryLabels[category]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Tên hiển thị</Label>
                <Input value={filterLabel} onChange={(event) => setFilterLabel(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Giá trị</Label>
                <Input
                  value={filterValue}
                  onChange={(event) => setFilterValue(event.target.value)}
                  placeholder="Tự tạo nếu bỏ trống"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={addFilterOption} disabled={saving}>
                  <Plus className="h-4 w-4" />
                  Thêm
                </Button>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {filterCategories.map((category) => (
                <div key={category} className="rounded-md border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold">{filterCategoryLabels[category]}</h3>
                    <Badge variant="outline">{config.filters[category].length}</Badge>
                  </div>
                  <div className="space-y-2">
                    {config.filters[category].length === 0 ? (
                      <p className="text-sm text-muted-foreground">Chưa có danh mục.</p>
                    ) : (
                      config.filters[category].map((option) => (
                        <div key={option.value} className="flex items-center justify-between rounded-md bg-muted px-3 py-2">
                          <span className="text-sm">{option.label}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteFilterOption(category, option.value)}
                            disabled={saving}
                            aria-label={`Xóa ${option.label}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="partners" className="space-y-5">
            <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
              <div className="space-y-2">
                <Label>Tên đối tác</Label>
                <Input
                  value={partnerDraft.name}
                  onChange={(event) => setPartnerDraft({ ...partnerDraft, name: event.target.value })}
                  placeholder="Tên công ty"
                />
              </div>
              <div className="space-y-2">
                <Label>Logo</Label>
                <Input
                  value={partnerDraft.logo}
                  onChange={(event) => setPartnerDraft({ ...partnerDraft, logo: event.target.value })}
                  placeholder="/carousel/company.webp hoặc URL"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={addPartner} disabled={saving}>
                  <Plus className="h-4 w-4" />
                  Thêm
                </Button>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Logo</TableHead>
                  <TableHead>Tên</TableHead>
                  <TableHead>Đường dẫn</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {config.partners.map((partner) => (
                  <TableRow key={partner.id}>
                    <TableCell>
                      <div className="flex h-12 w-20 items-center justify-center rounded-md border bg-white p-2">
                        <img src={partner.logo} alt={partner.name} className="max-h-8 object-contain" />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{partner.name}</TableCell>
                    <TableCell className="text-muted-foreground">{partner.logo}</TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <Button variant="ghost" size="icon" onClick={() => deletePartner(partner.id)} disabled={saving}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="verification" className="space-y-5">
            <div className="grid gap-3 md:grid-cols-[1fr_1fr_140px_1fr_120px_auto]">
              <div className="space-y-2">
                <Label>Nhãn trường</Label>
                <Input
                  value={fieldDraft.label}
                  onChange={(event) => setFieldDraft({ ...fieldDraft, label: event.target.value })}
                  placeholder="Ví dụ: Website công ty"
                />
              </div>
              <div className="space-y-2">
                <Label>Tên trường</Label>
                <Input
                  value={fieldDraft.name}
                  onChange={(event) => setFieldDraft({ ...fieldDraft, name: event.target.value })}
                  placeholder="Tự tạo nếu bỏ trống"
                />
              </div>
              <div className="space-y-2">
                <Label>Kiểu</Label>
                <select
                  value={fieldDraft.type}
                  onChange={(event) =>
                    setFieldDraft({ ...fieldDraft, type: event.target.value as EmployerVerificationField["type"] })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="text">Text</option>
                  <option value="email">Email</option>
                  <option value="number">Number</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Placeholder</Label>
                <Input
                  value={fieldDraft.placeholder}
                  onChange={(event) => setFieldDraft({ ...fieldDraft, placeholder: event.target.value })}
                />
              </div>
              <div className="flex items-end">
                <label className="flex h-10 items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean(fieldDraft.required)}
                    onChange={(event) => setFieldDraft({ ...fieldDraft, required: event.target.checked })}
                  />
                  Bắt buộc
                </label>
              </div>
              <div className="flex items-end">
                <Button onClick={addVerificationField} disabled={saving}>
                  <Plus className="h-4 w-4" />
                  Thêm
                </Button>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trường</TableHead>
                  <TableHead>Tên lưu trữ</TableHead>
                  <TableHead>Kiểu</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {config.employerVerificationFields.map((field) => (
                  <TableRow key={field.id}>
                    <TableCell className="font-medium">{field.label}</TableCell>
                    <TableCell>{field.name}</TableCell>
                    <TableCell>{field.type}</TableCell>
                    <TableCell>
                      <Badge variant={field.required ? "default" : "outline"}>
                        {field.required ? "Bắt buộc" : "Không bắt buộc"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteVerificationField(field.id)}
                          disabled={saving}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex items-start gap-2 rounded-md border bg-muted p-3 text-sm text-muted-foreground">
              <Building2 className="mt-0.5 h-4 w-4" />
              Các trường mới sẽ xuất hiện trong form yêu cầu xác thực ở trang chủ và được lưu vào phần dữ liệu bổ sung của yêu cầu.
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
