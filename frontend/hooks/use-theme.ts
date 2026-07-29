import { useTheme as useNextTheme } from "next-themes";

export function useTheme() {
  const { theme, setTheme, resolvedTheme } = useNextTheme();

  return {
    theme,
    setTheme,
    isDark: resolvedTheme === "dark",
    toggle: () => setTheme(resolvedTheme === "dark" ? "light" : "dark"),
  };
}
