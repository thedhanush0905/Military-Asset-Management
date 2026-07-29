export const ROUTES = {
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  ASSETS: {
    CATALOG: "/assets/catalog",
    EQUIPMENT: "/assets/equipment",
    EQUIPMENT_DETAIL: (id: string) => `/assets/equipment/${id}`,
    INVENTORY: "/assets/inventory",
  },
  OPERATIONS: {
    ASSIGNMENTS: "/operations/assignments",
    TRANSFERS: "/operations/transfers",
    MAINTENANCE: "/operations/maintenance",
    PROCUREMENT: "/operations/procurement",
    DISPOSAL: "/operations/disposal",
    INSPECTIONS: "/operations/inspections",
  },
  MANAGEMENT: {
    PERSONNEL: "/management/personnel",
    SUPPLIERS: "/management/suppliers",
    ORGANIZATION: "/management/organization",
    BASES: "/management/bases",
    USERS: "/management/users",
  },
  MONITORING: {
    NOTIFICATIONS: "/monitoring/notifications",
    AUDIT_LOGS: "/monitoring/audit-logs",
  },
  REPORTS: "/reports",
  ADMINISTRATION: {
    CONFIG: "/administration/config",
  },
  FORBIDDEN: "/forbidden",
  UNAUTHORIZED: "/unauthorized",
};
