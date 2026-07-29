import { theme } from "@/lib/theme";

export const themeConfig = {
  ...theme,
  chartColors: {
    categorical: [
      theme.statusColors.available,
      theme.statusColors.assigned,
      theme.statusColors.maintenance,
      theme.statusColors.transfer,
      theme.statusColors.disposed,
      theme.statusColors.critical,
    ],
    available: theme.statusColors.available,
    assigned: theme.statusColors.assigned,
    maintenance: theme.statusColors.maintenance,
    transfer: theme.statusColors.transfer,
    disposed: theme.statusColors.disposed,
    critical: theme.statusColors.critical,
  },
};
