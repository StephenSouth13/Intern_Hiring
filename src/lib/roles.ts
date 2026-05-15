export const USER_ROLES = {
  CANDIDATE: "CANDIDATE",
  EMPLOYER: "EMPLOYER",
  ADMIN: "ADMIN",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

const normalizeRole = (role?: string | null) => role?.trim().toUpperCase();

export const isAdminRole = (role?: string | null) => normalizeRole(role) === USER_ROLES.ADMIN;

export const isEmployerRole = (role?: string | null) => normalizeRole(role) === USER_ROLES.EMPLOYER;

export const isCandidateRole = (role?: string | null) => normalizeRole(role) === USER_ROLES.CANDIDATE;

export const isRestrictedAccount = (user?: { restricted?: boolean; isRestricted?: boolean; status?: string } | null) => {
  if (!user) return false;

  const status = user.status?.trim().toUpperCase();
  return Boolean(user.restricted || user.isRestricted || status === "RESTRICTED" || status === "BLOCKED");
};
