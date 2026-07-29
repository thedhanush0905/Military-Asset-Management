export const ROLES = {
  ADMIN: "ADMIN" as const,
  BASE_COMMANDER: "BASE_COMMANDER" as const,
  LOGISTICS_OFFICER: "LOGISTICS_OFFICER" as const,
};

export type UserRole = (typeof ROLES)[keyof typeof ROLES];
