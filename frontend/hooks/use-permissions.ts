import { useAuth } from "./use-auth";
import { hasPermission } from "@/utils/permissions";
import { PERMISSIONS } from "@/constants/permissions";

export function usePermissions() {
  const { user } = useAuth();
  
  const canView = user ? hasPermission(user.role, PERMISSIONS.VIEW_ASSETS) : false;
  const canEdit = user ? hasPermission(user.role, PERMISSIONS.EDIT_ASSETS) : false;
  const canDelete = user ? hasPermission(user.role, PERMISSIONS.DELETE_ASSETS) : false;
  const canApprove = user ? hasPermission(user.role, PERMISSIONS.APPROVE_TRANSFERS) : false;
  const canManageUsers = user ? hasPermission(user.role, PERMISSIONS.MANAGE_USERS) : false;
  const canManageMaintenance = user ? hasPermission(user.role, PERMISSIONS.MANAGE_MAINTENANCE) : false;
  const canManageProcurement = user ? hasPermission(user.role, PERMISSIONS.MANAGE_PROCUREMENT) : false;
  const canViewAuditLogs = user ? hasPermission(user.role, PERMISSIONS.VIEW_AUDIT_LOGS) : false;
  const canManageConfig = user ? hasPermission(user.role, PERMISSIONS.MANAGE_CONFIG) : false;

  return {
    canView,
    canEdit,
    canDelete,
    canApprove,
    canManageUsers,
    canManageMaintenance,
    canManageProcurement,
    canViewAuditLogs,
    canManageConfig,
  };
}
