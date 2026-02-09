"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "zed";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_SCRIPT = `
(function() {
  try {
    var theme = localStorage.getItem('vionix-theme') || 'zed';
    if (!['light', 'dark', 'zed'].includes(theme)) theme = 'zed';
    document.documentElement.classList.remove('light', 'dark', 'zed');
    document.documentElement.classList.add(theme);
  } catch (e) {
    document.documentElement.classList.add('zed');
  }
})();
`;

export function ThemeProvider({
  children,
  defaultTheme = "zed",
}: {
  children: React.ReactNode;
  defaultTheme?: Theme;
}) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);

  useEffect(() => {
    const savedTheme = localStorage.getItem("vionix-theme") as Theme | null;
    if (savedTheme && ["light", "dark", "zed"].includes(savedTheme)) {
      setThemeState(savedTheme);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark", "zed");
    root.classList.add(theme);
    localStorage.setItem("vionix-theme", theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
