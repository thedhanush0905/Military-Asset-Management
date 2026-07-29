import { create } from "zustand";

interface SidebarStore {
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (val: boolean) => void;
}

export const useSidebarStore = create<SidebarStore>((set) => ({
  collapsed: false,
  toggle: () => set((state) => {
    const newVal = !state.collapsed;
    if (typeof window !== "undefined") {
      localStorage.setItem("aegis-sidebar-collapsed", String(newVal));
    }
    return { collapsed: newVal };
  }),
  setCollapsed: (collapsed) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("aegis-sidebar-collapsed", String(collapsed));
    }
    set({ collapsed });
  },
}));

export function useSidebar() {
  const { collapsed, toggle, setCollapsed } = useSidebarStore();
  return { collapsed, toggle, setCollapsed };
}
