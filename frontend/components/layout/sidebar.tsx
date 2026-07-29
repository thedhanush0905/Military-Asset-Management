"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/cn";
import { useSidebar } from "@/hooks/use-sidebar";
import { useAuth } from "@/hooks/use-auth";
import { usePermissions } from "@/hooks/use-permissions";
import { navigationConfig, NavigationItem } from "@/config/navigation";
import { ICONS } from "@/constants/icons";
import { useQuery } from "@tanstack/react-query";
import { notificationService } from "@/services/notification.service";
import { Shield, ChevronDown, ChevronRight, LogOut, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggle, setCollapsed } = useSidebar();
  const { user, logout } = useAuth();
  const permissions = usePermissions();

  const { data: unreadData } = useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: () => notificationService.getUnread(),
    enabled: !!user,
    refetchInterval: 15000,
  });

  const unreadCount = unreadData?.data?.count || 0;

  // Collapsed sections tracking
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (group: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }));
  };

  // Check item permissions
  const hasAccess = (item: NavigationItem) => {
    if (!item.permission) return true;
    // Check if user has permission
    if (item.permission === "manage_users") return permissions.canManageUsers;
    if (item.permission === "manage_config") return permissions.canManageConfig;
    if (item.permission === "view_audit_logs") return permissions.canViewAuditLogs;
    return permissions.canView;
  };

  // Load persisted state from localStorage on mount
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const persisted = localStorage.getItem("aegis-sidebar-collapsed");
      if (persisted !== null) {
        setCollapsed(persisted === "true");
      }
    }
  }, [setCollapsed]);

  return (
    <aside
      className={cn(
        "flex flex-col h-screen sticky top-0 bg-[#1A2820] text-[#E6E8E6] border-r border-[#22352B] transition-all duration-200 z-30 shrink-0",
        collapsed ? "w-[72px]" : "w-[280px]"
      )}
    >
      {/* Branding Header */}
      <div className={cn(
        "flex items-center gap-3 p-4 border-b border-[#22352B] overflow-hidden whitespace-nowrap",
        collapsed ? "flex-col items-center gap-3.5 py-4 px-2" : "justify-between"
      )}>
        <button
          onClick={() => collapsed && toggle()}
          className="flex items-center gap-2 text-left cursor-pointer focus-ring-premium rounded focus:outline-none"
          aria-label="AEGIS Logo Home"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-[8px] bg-[#2F4F3A] text-white shrink-0">
            <Shield className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col transition-opacity duration-200">
              <span className="font-extrabold tracking-wider text-sm text-[#E6E8E6]">AEGIS</span>
              <span className="text-[9px] text-muted-foreground uppercase tracking-[0.18em] font-semibold">Asset System</span>
            </div>
          )}
        </button>
        <button 
          onClick={toggle}
          className="text-muted-foreground hover:text-white transition-colors focus-ring-premium rounded p-1 focus:outline-none"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 py-5 overflow-y-auto scrollbar-premium px-3.5 space-y-5">
        {navigationConfig.map((group) => {
          // Filter items based on permissions
          const visibleItems = group.items.filter(hasAccess);
          if (visibleItems.length === 0) return null;

          const isGroupCollapsed = collapsedGroups[group.group];

          return (
            <div key={group.group} className="space-y-1.5">
              {/* Group Title Toggle */}
              {!collapsed && (
                <button
                  onClick={() => toggleGroup(group.group)}
                  className="w-full flex items-center justify-between px-2 text-[9px] font-extrabold text-[#A4B29E]/50 hover:text-white uppercase tracking-widest py-1.5 transition-premium"
                >
                  <span>{group.group}</span>
                  {isGroupCollapsed ? (
                    <ChevronRight className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </button>
              )}

              {/* Items List */}
              {(!isGroupCollapsed || collapsed) && (
                <div className="space-y-1">
                  {visibleItems.map((item) => {
                    const Icon = ICONS[item.icon] || Shield;
                    const isActive = pathname === item.route;

                    return (
                      <Link
                        key={item.label}
                        href={item.route}
                        className={cn(
                          "flex items-center gap-3.5 px-3 py-2.5 rounded-[10px] text-sm font-medium tracking-wide transition-all group relative border-l-2 focus-ring-premium focus:outline-none",
                          isActive
                            ? "bg-[#2F4F3A] text-white border-l-[#556B2F] shadow-sm"
                            : "text-[#A4B29E] hover:bg-[#22352B]/40 hover:text-white border-l-transparent",
                          collapsed && "justify-center"
                        )}
                        title={collapsed ? item.label : undefined}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span className="truncate transition-opacity duration-200">{item.label}</span>}
                        
                        {/* Notifications Badge */}
                        {item.badgeKey === "notifications" && !collapsed && unreadCount > 0 && (
                          <span className="ml-auto bg-[#2E7D32] text-white text-[9px] font-extrabold h-4 w-4 rounded-full flex items-center justify-center">
                            {unreadCount}
                          </span>
                        )}

                        {/* Collapsed Tooltip */}
                        {collapsed && (
                          <div className="absolute left-16 bg-[#1A2820] text-white text-[10px] font-bold uppercase tracking-wider py-1 px-2 rounded border border-[#22352B] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                            {item.label}
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User Profile Block */}
      <div className="mt-auto p-4 border-t border-[#22352B] bg-[#111B15] flex flex-col gap-3">
        <div className={cn(
          "flex items-center gap-3 overflow-hidden group relative",
          collapsed ? "justify-center flex-col py-1.5" : "justify-between"
        )}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#2F4F3A] border border-[#22352B] flex items-center justify-center text-white text-xs font-bold shrink-0">
              {getInitials(user?.name)}
            </div>
            {!collapsed && (
              <div className="flex flex-col truncate transition-opacity duration-200">
                <span className="text-xs font-bold truncate">{user?.name || "Unknown User"}</span>
                <span className="text-[10px] text-muted-foreground truncate">{formatRole(user?.role)}</span>
              </div>
            )}
          </div>
          {!collapsed && (
            <button
              onClick={logout}
              className="text-muted-foreground hover:text-destructive transition-colors focus-ring-premium rounded p-1 focus:outline-none"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
          
          {/* Avatar Hover Tooltip when collapsed */}
          {collapsed && (
            <div className="absolute left-16 bg-[#1A2820] text-white text-[10px] font-bold uppercase tracking-wider py-1 px-2 rounded border border-[#22352B] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
              {user?.name || "Unknown User"} • {formatRole(user?.role)}
            </div>
          )}
        </div>
        {collapsed && (
          <button
            onClick={logout}
            className="flex justify-center text-muted-foreground hover:text-destructive transition-colors py-1 focus-ring-premium rounded focus:outline-none"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </div>
    </aside>
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
