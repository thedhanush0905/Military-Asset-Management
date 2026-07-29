import { ROLE_PERMISSIONS, Permission } from "@/constants/permissions";
import { Role } from "@/types/user";

export function hasPermission(role: Role, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions ? permissions.includes(permission) : false;
}
