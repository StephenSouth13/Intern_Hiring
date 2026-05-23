import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Navigate } from "react-router-dom";
import {
  AlertTriangle,
  Briefcase,
  CheckCircle2,
  Eye,
  FileCheck2,
  Loader2,
  RefreshCw,
  RotateCcw,
  Settings2,
  ShieldAlert,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { adminApi, isApiError, recruiterApi, type AdminJobPost, type AdminUser, type RecruiterApplication } from "@/lib/api";
import { isAdminRole } from "@/lib/roles";
import { CategoryManagementPanel } from "@/components/admin/CategoryManagementPanel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

type AdminSection = "users" | "jobs" | "employer-requests" | "categories";

const getErrorMessage = (error: unknown, fallback: string) => (error instanceof Error ? error.message : fallback);


const isTrashedJob = (job: AdminJobPost) => {
  const status = job.status?.toUpperCase();
  return Boolean(job.deletedAt || status === "TRASHED" || status === "DELETED");
};

const formatDate = (value?: string | null, locale = "en-US") => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(locale);
};


const AdminDashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, token, isAuthenticated, isLoading } = useAuth();
  const [activeSection, setActiveSection] = useState<AdminSection>("users");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [jobs, setJobs] = useState<AdminJobPost[]>([]);
  const [requests, setRequests] = useState<RecruiterApplication[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [selectedJob, setSelectedJob] = useState<AdminJobPost | null>(null);
  const [rejectingRequest, setRejectingRequest] = useState<RecruiterApplication | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [loadingData, setLoadingData] = useState(true);
  const [actionId, setActionId] = useState<string | number | null>(null);

  const activeJobs = useMemo(() => jobs.filter((job) => !isTrashedJob(job)), [jobs]);
  const trashedJobs = useMemo(() => jobs.filter(isTrashedJob), [jobs]);
  const pendingRequests = useMemo(
    () => requests.filter((request) => request.status === "PENDING"),
    [requests],
  );
  const dateLocale = i18n.language?.startsWith("vi") ? "vi-VN" : "en-US";
  const formatAdminDate = useCallback((value?: string | null) => formatDate(value, dateLocale), [dateLocale]);

  const loadData = useCallback(async () => {
    if (!token) return;

    setLoadingData(true);
    try {
      const [userList, jobList, requestList] = await Promise.all([
        adminApi.listUsers(token),
        adminApi.listJobs(token),
        recruiterApi.listApplications(token).catch(() => []),
      ]);

      setUsers(userList);
      setJobs(jobList);
      setRequests(requestList);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, t("admin.loadError")));
    } finally {
      setLoadingData(false);
    }
  }, [token, t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const requireConfirm = (message: string) => window.confirm(message);




  const handleRestriction = async (targetUser: AdminUser, restricted: boolean) => {
    if (!token) return;

    setActionId(targetUser.id);
    try {
      await adminApi.setUserRestriction(token, targetUser.id, restricted);

      toast.success(restricted ? t("admin.restrictionSetSuccess") : t("admin.restrictionRemovedSuccess"));
      await loadData();
    } catch (error: unknown) {
      if (isApiError(error) && error.status === 403) {
        toast.error(t("admin.restrictionForbidden"));
      } else {
        toast.error(error instanceof Error ? error.message : t("admin.restrictionUpdateError"));
      }
    } finally {
      setActionId(null);
    }
  };

  const handleTrashJob = async (job: AdminJobPost) => {
    if (!token) return;

    setActionId(job.id);
    try {
      await adminApi.moveJobToTrash(token, job.id);

      toast.success(t("admin.trashJobSuccess"));
      await loadData();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, t("admin.trashJobError")));
    } finally {
      setActionId(null);
    }
  };

  const handleRestoreJob = async (job: AdminJobPost) => {
    if (!token) return;

    setActionId(job.id);
    try {
      await adminApi.restoreJob(token, job.id);

      toast.success(t("admin.restoreJobSuccess"));
      await loadData();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, t("admin.restoreJobError")));
    } finally {
      setActionId(null);
    }
  };

  const handleDeleteJobPermanently = async (job: AdminJobPost) => {
    if (!token) return;
    if (!requireConfirm(t("admin.deleteJobConfirm"))) return;

    setActionId(job.id);
    try {
      await adminApi.deleteJobPermanently(token, job.id);
      toast.success(t("admin.deleteJobSuccess"));
      await loadData();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, t("admin.deleteJobError")));
    } finally {
      setActionId(null);
    }
  };

  const handleReviewRequest = async (
    application: RecruiterApplication,
    approved: boolean,
    reason?: string,
  ) => {
    if (!token) return;

    setActionId(application.id);
    try {
      await recruiterApi.reviewApplication(token, application.id, approved, reason);

      toast.success(approved ? t("admin.approveRecruiterSuccess") : t("admin.rejectRequestSuccess"));
      setRejectingRequest(null);
      setRejectionReason("");
      await loadData();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, t("admin.reviewRequestError")));
    } finally {
      setActionId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdminRole(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <Badge className="mb-3 bg-primary text-primary-foreground">ADMIN</Badge>
              <h1 className="text-3xl font-bold text-slate-950">{t("admin.title")}</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("admin.description")}
              </p>
            </div>
            <Button variant="outline" onClick={loadData} disabled={loadingData}>
              {loadingData ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              {t("common.refresh")}
            </Button>
          </div>
        </div>
      </section>

      <section className="container mx-auto space-y-6 px-4 py-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card
            className={`cursor-pointer transition hover:shadow-md ${activeSection === "users" ? "border-primary" : ""}`}
            onClick={() => setActiveSection("users")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("admin.stats.usersTitle")}</CardTitle>
              <Users className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">{t("admin.stats.usersDescription")}</p>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition hover:shadow-md ${activeSection === "jobs" ? "border-primary" : ""}`}
            onClick={() => setActiveSection("jobs")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("admin.stats.jobsTitle")}</CardTitle>
              <Briefcase className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{activeJobs.length}</div>
              <p className="text-xs text-muted-foreground">{t("admin.stats.trashCount", { count: trashedJobs.length })}</p>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition hover:shadow-md ${
              activeSection === "employer-requests" ? "border-primary" : ""
            }`}
            onClick={() => setActiveSection("employer-requests")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("admin.stats.requestsTitle")}</CardTitle>
              <FileCheck2 className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{pendingRequests.length}</div>
              <p className="text-xs text-muted-foreground">{t("admin.stats.requestsDescription")}</p>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition hover:shadow-md ${activeSection === "categories" ? "border-primary" : ""}`}
            onClick={() => setActiveSection("categories")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("admin.stats.categoriesTitle")}</CardTitle>
              <Settings2 className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{t("admin.stats.categoriesDescription")}</p>
            </CardContent>
          </Card>
        </div>

        {loadingData ? (
          <Card>
            <CardContent className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </CardContent>
          </Card>
        ) : (
          <>
            {activeSection === "users" && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("admin.users.title")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>{t("admin.users.fullName")}</TableHead>
                        <TableHead>{t("common.role")}</TableHead>
                        <TableHead>{t("common.status")}</TableHead>
                        <TableHead className="text-right">{t("common.actions")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((account) => {
                        const restricted =
                          account.restricted ||
                          account.isRestricted ||
                          account.status?.toUpperCase() === "RESTRICTED" ||
                          account.status?.toUpperCase() === "BLOCKED";

                        return (
                          <TableRow key={account.id}>
                            <TableCell>{account.email}</TableCell>
                            <TableCell>
                              {account.lastName} {account.firstName}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{account.role}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={restricted ? "destructive" : "secondary"}>
                                {restricted ? t("admin.users.restricted") : t("admin.users.active")}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" size="sm" onClick={() => setSelectedUser(account)}>
                                  <Eye className="h-4 w-4" />
                                  {t("common.view")}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={actionId === account.id || isAdminRole(account.role)}
                                  onClick={() => handleRestriction(account, !restricted)}
                                >
                                  <ShieldAlert className="h-4 w-4" />
                                  {restricted ? t("admin.users.unrestrict") : t("admin.users.restrict")}
                                </Button>

                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {activeSection === "jobs" && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("admin.jobs.title")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="active">
                    <TabsList>
                      <TabsTrigger value="active">{t("admin.jobs.activeTab")}</TabsTrigger>
                      <TabsTrigger value="trash">{t("admin.jobs.trashTab")}</TabsTrigger>
                    </TabsList>
                    <TabsContent value="active">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t("admin.jobs.titleColumn")}</TableHead>
                            <TableHead>{t("common.company")}</TableHead>
                            <TableHead>{t("common.recruiter")}</TableHead>
                            <TableHead>{t("admin.jobs.postedDate")}</TableHead>
                            <TableHead className="text-right">{t("common.actions")}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {activeJobs.map((job) => (
                            <TableRow key={job.id}>
                              <TableCell className="font-medium">{job.title}</TableCell>
                              <TableCell>{job.company || "-"}</TableCell>
                              <TableCell>{job.employerEmail || job.employerName || "-"}</TableCell>
                              <TableCell>{formatAdminDate(job.createdAt)}</TableCell>
                              <TableCell>
                                <div className="flex justify-end gap-2">
                                  <Button variant="outline" size="sm" onClick={() => setSelectedJob(job)}>
                                    <Eye className="h-4 w-4" />
                                    {t("common.details")}
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    disabled={actionId === job.id}
                                    onClick={() => handleTrashJob(job)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    {t("admin.jobs.moveToTrash")}
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TabsContent>
                    <TabsContent value="trash">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t("admin.jobs.titleColumn")}</TableHead>
                            <TableHead>{t("common.company")}</TableHead>
                            <TableHead>{t("admin.jobs.deletedDate")}</TableHead>
                            <TableHead className="text-right">{t("common.actions")}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {trashedJobs.map((job) => (
                            <TableRow key={job.id}>
                              <TableCell className="font-medium">{job.title}</TableCell>
                              <TableCell>{job.company || "-"}</TableCell>
                              <TableCell>{formatAdminDate(job.deletedAt)}</TableCell>
                              <TableCell>
                                <div className="flex justify-end gap-2">
                                  <Button variant="outline" size="sm" onClick={() => handleRestoreJob(job)}>
                                    <RotateCcw className="h-4 w-4" />
                                    {t("admin.jobs.restore")}
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    disabled={actionId === job.id}
                                    onClick={() => handleDeleteJobPermanently(job)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    {t("admin.jobs.deletePermanent")}
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}

            {activeSection === "employer-requests" && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("admin.requests.title")}</CardTitle>
                </CardHeader>
                <CardContent>
                  {requests.length === 0 ? (
                    <p className="py-8 text-center text-muted-foreground">{t("admin.requests.empty")}</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("admin.requests.applicantEmail")}</TableHead>
                          <TableHead>{t("admin.requests.registrationInfo")}</TableHead>
                          <TableHead>{t("common.status")}</TableHead>
                          <TableHead>{t("admin.requests.note")}</TableHead>
                          <TableHead className="text-right">{t("common.actions")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {requests.map((application) => {
                          const pending = application.status === "PENDING";

                          return (
                            <TableRow key={application.id}>
                              <TableCell className="font-medium">{application.applicantEmail}</TableCell>
                              <TableCell>
                                {application.formData && Object.keys(application.formData).length > 0 ? (
                                  <div className="space-y-1 text-xs">
                                    {Object.entries(application.formData).map(([key, value]) => (
                                      <div key={key}>
                                        <span className="font-medium">{key}:</span> {value || "-"}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    application.status === "APPROVED"
                                      ? "secondary"
                                      : application.status === "REJECTED"
                                        ? "destructive"
                                        : "outline"
                                  }
                                >
                                  {t(`admin.requests.statuses.${application.status}`)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">{application.reviewNote || "-"}</TableCell>
                              <TableCell>
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={!pending || actionId === application.id}
                                    onClick={() => handleReviewRequest(application, true)}
                                  >
                                    <CheckCircle2 className="h-4 w-4" />
                                    {t("admin.requests.approve")}
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    disabled={!pending || actionId === application.id}
                                    onClick={() => setRejectingRequest(application)}
                                  >
                                    <XCircle className="h-4 w-4" />
                                    {t("admin.requests.reject")}
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            )}

            {activeSection === "categories" && token && (
              <CategoryManagementPanel token={token} />
            )}
          </>
        )}
      </section>

      <Dialog open={Boolean(selectedUser)} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("admin.userDialog.title")}</DialogTitle>
            <DialogDescription>{t("admin.userDialog.description")}</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="grid gap-3 text-sm md:grid-cols-2">
              <div><strong>Email:</strong> {selectedUser.email}</div>
              <div><strong>{t("common.role")}:</strong> {selectedUser.role}</div>
              <div><strong>{t("admin.users.fullName")}:</strong> {selectedUser.lastName} {selectedUser.firstName}</div>
              <div><strong>{t("admin.userDialog.phone")}:</strong> {selectedUser.phoneNumber || "-"}</div>
              <div><strong>{t("admin.userDialog.gender")}:</strong> {selectedUser.gender || "-"}</div>
              <div><strong>{t("admin.userDialog.dob")}:</strong> {selectedUser.dob || "-"}</div>
              <div><strong>{t("admin.userDialog.createdAt")}:</strong> {formatAdminDate(selectedUser.createdAt)}</div>
              <div><strong>{t("admin.userDialog.cv")}:</strong> {selectedUser.cvUrl ? <a className="text-primary underline" href={selectedUser.cvUrl} target="_blank" rel="noreferrer">{t("admin.userDialog.viewCv")}</a> : "-"}</div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedUser(null)}>{t("common.close")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(selectedJob)} onOpenChange={(open) => !open && setSelectedJob(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{t("admin.jobDialog.title")}</DialogTitle>
            <DialogDescription>{t("admin.jobDialog.description")}</DialogDescription>
          </DialogHeader>
          {selectedJob && (
            <div className="space-y-3 text-sm">
              <div className="grid gap-3 md:grid-cols-2">
                <div><strong>{t("admin.jobs.titleColumn")}:</strong> {selectedJob.title}</div>
                <div><strong>{t("common.company")}:</strong> {selectedJob.company || "-"}</div>
                <div><strong>{t("common.recruiter")}:</strong> {selectedJob.employerEmail || selectedJob.employerName || "-"}</div>
                <div><strong>{t("admin.jobDialog.location")}:</strong> {selectedJob.location || "-"}</div>
                <div><strong>{t("common.type")}:</strong> {selectedJob.type || "-"}</div>
                <div><strong>{t("common.salary")}:</strong> {selectedJob.salary || "-"}</div>
              </div>
              <div>
                <strong>{t("common.description")}:</strong>
                <p className="mt-2 whitespace-pre-wrap rounded-md bg-muted p-3">{selectedJob.description || "-"}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedJob(null)}>{t("common.close")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(rejectingRequest)} onOpenChange={(open) => !open && setRejectingRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("admin.rejectDialog.title")}</DialogTitle>
            <DialogDescription>{t("admin.rejectDialog.description")}</DialogDescription>
          </DialogHeader>
          <Textarea
            value={rejectionReason}
            onChange={(event) => setRejectionReason(event.target.value)}
            placeholder={t("admin.rejectDialog.placeholder")}
          />
          <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            <AlertTriangle className="mt-0.5 h-4 w-4" />
            {t("admin.rejectDialog.warning")}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectingRequest(null)}>{t("common.cancel")}</Button>
            <Button
              variant="destructive"
              onClick={() => rejectingRequest && handleReviewRequest(rejectingRequest, false, rejectionReason)}
            >
              {t("admin.requests.reject")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default AdminDashboard;
