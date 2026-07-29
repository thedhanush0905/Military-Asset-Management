import { ROUTES } from "@/constants/routes";
import { PERMISSIONS } from "@/constants/permissions";
import { IconKey } from "@/constants/icons";

export interface NavigationItem {
  label: string;
  route: string;
  icon: IconKey;
  permission?: string;
  badgeKey?: string;
}

export interface NavigationGroup {
  group: string;
  items: NavigationItem[];
}

export const navigationConfig: NavigationGroup[] = [
  {
    group: "Overview",
    items: [
      {
        label: "Dashboard",
        route: ROUTES.DASHBOARD,
        icon: "Dashboard",
        permission: PERMISSIONS.VIEW_DASHBOARD,
      },
    ],
  },
  {
    group: "Assets",
    items: [
      {
        label: "Equipment Catalog",
        route: ROUTES.ASSETS.CATALOG,
        icon: "Boxes",
        permission: PERMISSIONS.VIEW_ASSETS,
      },
      {
        label: "Equipment Assets",
        route: ROUTES.ASSETS.EQUIPMENT,
        icon: "Shield",
        permission: PERMISSIONS.VIEW_ASSETS,
      },
      {
        label: "Inventory",
        route: ROUTES.ASSETS.INVENTORY,
        icon: "Boxes",
        permission: PERMISSIONS.VIEW_ASSETS,
      },
    ],
  },
  {
    group: "Operations",
    items: [
      {
        label: "Assignments",
        route: ROUTES.OPERATIONS.ASSIGNMENTS,
        icon: "Users",
        permission: PERMISSIONS.VIEW_ASSETS,
      },
      {
        label: "Transfers",
        route: ROUTES.OPERATIONS.TRANSFERS,
        icon: "Truck",
        permission: PERMISSIONS.VIEW_ASSETS,
      },
      {
        label: "Maintenance",
        route: ROUTES.OPERATIONS.MAINTENANCE,
        icon: "Wrench",
        permission: PERMISSIONS.VIEW_ASSETS,
      },
      {
        label: "Procurement",
        route: ROUTES.OPERATIONS.PROCUREMENT,
        icon: "ShoppingBag",
        permission: PERMISSIONS.VIEW_ASSETS,
      },
      {
        label: "Disposal",
        route: ROUTES.OPERATIONS.DISPOSAL,
        icon: "Trash2",
        permission: PERMISSIONS.VIEW_ASSETS,
      },
      {
        label: "Inspections",
        route: ROUTES.OPERATIONS.INSPECTIONS,
        icon: "ClipboardCheck",
        permission: PERMISSIONS.VIEW_ASSETS,
      },
    ],
  },
  {
    group: "Management",
    items: [
      {
        label: "Personnel",
        route: ROUTES.MANAGEMENT.PERSONNEL,
        icon: "UserCheck",
        permission: PERMISSIONS.VIEW_ASSETS,
      },
      {
        label: "Suppliers",
        route: ROUTES.MANAGEMENT.SUPPLIERS,
        icon: "Building2",
        permission: PERMISSIONS.VIEW_ASSETS,
      },
      {
        label: "Organization",
        route: ROUTES.MANAGEMENT.ORGANIZATION,
        icon: "Sitemap",
        permission: PERMISSIONS.VIEW_ASSETS,
      },
      {
        label: "Bases",
        route: ROUTES.MANAGEMENT.BASES,
        icon: "MapPin",
        permission: PERMISSIONS.VIEW_ASSETS,
      },
      {
        label: "Users",
        route: ROUTES.MANAGEMENT.USERS,
        icon: "Lock",
        permission: PERMISSIONS.MANAGE_USERS,
      },
    ],
  },
  {
    group: "Monitoring",
    items: [
      {
        label: "Notifications",
        route: ROUTES.MONITORING.NOTIFICATIONS,
        icon: "Bell",
        permission: PERMISSIONS.VIEW_DASHBOARD,
        badgeKey: "notifications",
      },
      {
        label: "Audit Logs",
        route: ROUTES.MONITORING.AUDIT_LOGS,
        icon: "History",
        permission: PERMISSIONS.VIEW_AUDIT_LOGS,
      },
    ],
  },
  {
    group: "Administration",
    items: [
      {
        label: "System Configuration",
        route: ROUTES.ADMINISTRATION.CONFIG,
        icon: "Settings",
        permission: PERMISSIONS.MANAGE_CONFIG,
      },
    ],
  },
];
