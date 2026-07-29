"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/utils/cn";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { Search, Bell, Sun, Moon, ChevronRight, LogOut, RotateCw, AlertCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "@/services/notification.service";
import { searchService } from "@/services/search.service";

interface TopbarNotification {
  id: string;
  title: string;
  message: string;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  createdAt: string;
  read: boolean;
}

export function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { isDark, toggle } = useTheme();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchResultsQuery = useQuery({
    queryKey: ["global-search", debouncedQuery],
    queryFn: () => searchService.globalSearch(debouncedQuery),
    enabled: debouncedQuery.trim().length > 1,
  });

  const searchResults = searchResultsQuery.data?.data?.results || [];

  const mapBackendUrlToFrontend = (backendUrl: string, type: string): string => {
    const parts = backendUrl.split("/");
    const id = parts[parts.length - 1];
    
    switch (type.toUpperCase()) {
      case "ASSET":
        return `/assets/equipment/${id}`;
      case "EQUIPMENT":
        return `/assets/catalog`;
      case "USER":
        return `/management/users`;
      case "PERSONNEL":
        return `/management/personnel`;
      case "BASE":
        return `/management/bases`;
      case "ASSIGNMENT":
        return `/operations/assignments`;
      case "TRANSFER":
        return `/operations/transfers`;
      case "MAINTENANCE":
        return `/operations/maintenance`;
      case "PROCUREMENT":
        return `/operations/procurement`;
      case "DISPOSAL":
        return `/operations/disposal`;
      case "INSPECTION":
        return `/operations/inspections`;
      case "SUPPLIER":
        return `/management/suppliers`;
      case "AUDIT_LOG":
        return `/monitoring/audit-logs`;
      default:
        return "/dashboard";
    }
  };

  const queryClient = useQueryClient();

  const { data: unreadNotificationsData } = useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: () => notificationService.getUnread(),
  });

  const unreadNotifications = (unreadNotificationsData?.data?.notifications || []) as unknown as TopbarNotification[];
  const unreadCount = unreadNotificationsData?.data?.count || 0;
  const criticalCount = unreadNotifications.filter((n: TopbarNotification) => n.priority === "CRITICAL").length;

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationService.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  // Generate Breadcrumbs
  const getBreadcrumbs = () => {
    const paths = pathname.split("/").filter(Boolean);
    if (paths.length === 0) return [{ label: "Command Center", href: "/dashboard" }];

    return paths.map((path, idx) => {
      const href = "/" + paths.slice(0, idx + 1).join("/");
      let label = path.charAt(0).toUpperCase() + path.slice(1);
      
      // Formatting specific labels
      if (path === "dashboard") label = "Dashboard";
      if (path === "catalog") label = "Equipment Catalog";
      if (path === "equipment") label = "Equipment Assets";
      if (path === "inventory") label = "Inventory Control";
      if (path === "assignments") label = "Assignments";
      if (path === "transfers") label = "Transfers & Logistics";
      if (path === "maintenance") label = "Maintenance Logs";
      if (path === "procurement") label = "Procurement Pipeline";
      if (path === "disposal") label = "Decommissioning";
      if (path === "inspections") label = "Safety Inspections";
      if (path === "personnel") label = "Personnel Roster";
      if (path === "suppliers") label = "Vendor Registry";
      if (path === "organization") label = "Command Tree";
      if (path === "bases") label = "Base Allocations";
      if (path === "users") label = "System Access Control";
      if (path === "notifications") label = "System Alerts";
      if (path === "audit-logs") label = "Change Ledger Logs";
      if (path === "config") label = "Configuration Profiles";

      return { label, href };
    });
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="sticky top-0 bg-white dark:bg-[#111B15] border-b border-[#E6E8E6] dark:border-[#22352B] h-[64px] flex items-center justify-between px-6 z-20 shrink-0">
      
      {/* Breadcrumbs (Left) */}
      <div className="hidden sm:flex items-center gap-1.5 text-xs font-normal text-muted-foreground">
        <Link href="/dashboard" className="hover:text-foreground hover:font-medium">Command</Link>
        {breadcrumbs.map((bc, idx) => (
          <React.Fragment key={bc.href}>
            <ChevronRight className="h-3 w-3 shrink-0" />
            <Link 
              href={bc.href} 
              className={cn(
                "truncate max-w-[120px] md:max-w-[200px] transition-all",
                idx === breadcrumbs.length - 1 
                  ? "text-[#1A2820] dark:text-[#F5F5F2] font-semibold" 
                  : "hover:text-foreground hover:font-medium"
              )}
            >
              {bc.label}
            </Link>
          </React.Fragment>
        ))}
      </div>

      {/* Global Search (Center) */}
      <div ref={searchRef} className="flex-1 max-w-xs mx-6 relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground select-none z-10">
          <Search className="h-4 w-4" />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsSearchFocused(true);
          }}
          onFocus={() => setIsSearchFocused(true)}
          placeholder="Search assets, serials, personnel..."
          className="w-full pl-9 pr-3 py-1.5 border border-[#E6E8E6] dark:border-[#22352B] rounded-[10px] bg-[#F5F5F2] dark:bg-[#0B120E] text-xs placeholder-muted-foreground/60 transition-all focus:outline-none focus:border-[#2F4F3A] dark:focus:border-[#4F7F60] focus:ring-1 focus:ring-[#2F4F3A] dark:focus:ring-[#4F7F60] relative z-10"
        />

        {/* Floating Search Results Dropdown Overlay */}
        {isSearchFocused && searchQuery.trim().length > 1 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#111B15] border border-[#E6E8E6] dark:border-[#22352B] rounded-[12px] shadow-lg max-h-[360px] overflow-y-auto z-50 p-3 flex flex-col min-w-[280px]">
            {searchResultsQuery.isLoading ? (
              <div className="flex items-center justify-center py-6 text-muted-foreground gap-2 text-xs">
                <RotateCw className="h-4.5 w-4.5 animate-spin text-[#2F4F3A] dark:text-[#4F7F60]" />
                <span>Searching databases...</span>
              </div>
            ) : searchResultsQuery.isError ? (
              <div className="flex items-center justify-center py-6 text-red-600 dark:text-red-400 gap-2 text-xs">
                <AlertCircle className="h-4.5 w-4.5" />
                <span>Search execution failed.</span>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="flex items-center justify-center py-6 text-muted-foreground text-xs text-center">
                <span>No matching records found.</span>
              </div>
            ) : (
              <div className="space-y-3 min-h-0 overflow-y-auto">
                {Object.entries(
                  searchResults.reduce((acc, item) => {
                    const typeLabel =
                      item.type === "EQUIPMENT"
                        ? "Equipment Catalog"
                        : item.type === "ASSET"
                        ? "Equipment Assets"
                        : item.type === "USER"
                        ? "Users"
                        : item.type === "BASE"
                        ? "Bases"
                        : item.type === "ASSIGNMENT"
                        ? "Assignments"
                        : item.type === "TRANSFER"
                        ? "Transfers"
                        : item.type === "MAINTENANCE"
                        ? "Maintenance"
                        : item.type === "PROCUREMENT"
                        ? "Procurements"
                        : item.type === "DISPOSAL"
                        ? "Disposals"
                        : item.type === "INSPECTION"
                        ? "Inspections"
                        : item.type === "SUPPLIER"
                        ? "Suppliers"
                        : item.type === "AUDIT_LOG"
                        ? "Audit Logs"
                        : item.type;
                    if (!acc[typeLabel]) acc[typeLabel] = [];
                    acc[typeLabel].push(item);
                    return acc;
                  }, {} as Record<string, typeof searchResults>)
                ).map(([category, items]) => (
                  <div key={category} className="mb-2 last:mb-0">
                    <div className="text-[9px] font-extrabold uppercase tracking-wider text-[#2F4F3A] dark:text-[#4F7F60] px-2 py-0.5 bg-[#F5F5F2] dark:bg-[#0B120E] rounded-[4px] mb-1">
                      {category}
                    </div>
                    <div className="space-y-0.5">
                      {items.map((item) => {
                        const targetUrl = mapBackendUrlToFrontend(item.url, item.type);
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              router.push(targetUrl);
                              setSearchQuery("");
                              setIsSearchFocused(false);
                            }}
                            className="w-full text-left px-2 py-1.5 hover:bg-[#F5F5F2] dark:hover:bg-[#1A2820] rounded-[6px] transition-all flex flex-col gap-0.5 group"
                          >
                            <span className="font-semibold text-xs text-[#1A2820] dark:text-[#F5F5F2] group-hover:text-[#2F4F3A] dark:group-hover:text-[#4F7F60]">
                              {item.title}
                            </span>
                            <span className="text-[10px] text-muted-foreground leading-normal truncate w-full">
                              {item.subtitle}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Operations (Right) */}
      <div className="flex items-center gap-5">
        
        {/* Theme Toggle */}
        <button
          onClick={toggle}
          className="p-1.5 hover:bg-[#F5F5F2] dark:hover:bg-[#1A2820] rounded-[8px] text-muted-foreground hover:text-foreground transition-all"
          title="Toggle Theme"
        >
          {isDark ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
        </button>

        {/* Alerts Trigger */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-1.5 hover:bg-[#F5F5F2] dark:hover:bg-[#1A2820] rounded-[8px] text-muted-foreground hover:text-foreground transition-all relative"
            title="Operational Alerts"
          >
            <Bell className="h-4.5 w-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-[#DC2626] text-[8px] font-extrabold text-white flex items-center justify-center scale-90">
                {unreadCount}
              </span>
            )}
          </button>
          {isNotifOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsNotifOpen(false)} />
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#111B15] border border-[#E6E8E6] dark:border-[#22352B] rounded-[12px] shadow-lg overflow-hidden z-20">
                <div className="p-3 border-b border-[#E6E8E6] dark:border-[#22352B] flex justify-between items-center bg-[#F5F5F2] dark:bg-[#0B120E]">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase tracking-wider">Alert Command Center</span>
                    {criticalCount > 0 && (
                      <span className="text-[9px] font-extrabold text-[#DC2626] mt-0.5">
                        {criticalCount} critical alert{criticalCount > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  {unreadNotifications.length > 0 && (
                    <button
                      onClick={() => markAllReadMutation.mutate()}
                      className="text-[9px] font-bold text-[#2F4F3A] dark:text-[#4F7F60] hover:underline"
                    >
                      MARK ALL READ
                    </button>
                  )}
                </div>
                <div className="max-h-60 overflow-y-auto divide-y divide-[#E6E8E6] dark:divide-[#22352B]">
                  {unreadNotifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-muted-foreground">
                      No unread notifications
                    </div>
                  ) : (
                    unreadNotifications.map((notif: TopbarNotification) => {
                      let priorityColor = "text-gray-500";
                      if (notif.priority === "CRITICAL") priorityColor = "text-[#DC2626] font-bold";
                      else if (notif.priority === "HIGH") priorityColor = "text-orange-500 font-semibold";
                      else if (notif.priority === "MEDIUM") priorityColor = "text-blue-500 font-semibold";

                      return (
                        <div
                          key={notif.id}
                          className="p-3 hover:bg-[#EFF1EF] dark:hover:bg-[#1A2820] text-xs transition-colors flex justify-between items-start gap-2 group cursor-pointer"
                          onClick={() => markReadMutation.mutate(notif.id)}
                        >
                          <div className="flex-1">
                            <div className={cn("mb-0.5", priorityColor)}>{notif.title}</div>
                            <div className="text-muted-foreground text-[10px]">{notif.message}</div>
                            <div className="text-muted-foreground text-[8px] mt-1">
                              {new Date(notif.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </div>
                          </div>
                          <button
                            className="opacity-0 group-hover:opacity-100 text-[9px] text-[#2F4F3A] hover:underline shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              markReadMutation.mutate(notif.id);
                            }}
                          >
                            Mark Read
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
                <div className="p-2 border-t border-[#E6E8E6] dark:border-[#22352B] text-center bg-[#F5F5F2] dark:bg-[#0B120E]">
                  <Link 
                    href="/monitoring/notifications" 
                    className="text-[10px] font-bold text-[#2F4F3A] dark:text-[#4F7F60] hover:underline"
                    onClick={() => setIsNotifOpen(false)}
                  >
                    VIEW ALL COMMAND ALERTS
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Dropdown Profile */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 cursor-pointer focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-[#2F4F3A] border border-[#E6E8E6] dark:border-[#22352B] flex items-center justify-center text-white text-xs font-bold shrink-0">
              {getInitials(user?.name)}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold leading-none text-[#1A2820] dark:text-[#F5F5F2]">
                {user?.name || "Unknown User"}
              </span>
              <span className="text-[10px] text-muted-foreground mt-0.5">
                {formatRole(user?.role)}
              </span>
            </div>
          </button>
          
          {isProfileOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#111B15] border border-[#E6E8E6] dark:border-[#22352B] rounded-[12px] shadow-lg overflow-hidden z-20 text-xs">
                <div className="p-3 border-b border-[#E6E8E6] dark:border-[#22352B] bg-[#F5F5F2] dark:bg-[#0B120E]">
                  <div className="font-bold text-[#1A2820] dark:text-[#F5F5F2]">{user?.name || "Unknown User"}</div>
                  <div className="text-muted-foreground text-[10px] mt-0.5">{user?.email || ""}</div>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-destructive hover:bg-destructive/5 transition-colors text-left"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

      </div>
    </header>
  );
}

const getInitials = (name?: string) => {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const formatRole = (role?: string) => {
  if (!role) return "";
  return role
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};
