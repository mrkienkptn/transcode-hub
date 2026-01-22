import { useState, useEffect } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Info, 
  Monitor, 
  Video,
  Settings,
  User,
  Moon,
  Sun,
  Radio,
  Layers
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { LanguageSwitcher } from "./LanguageSwitcher";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  defaultTab?: string;
}

interface AppSidebarProps {
  activeNav: string;
  onNavChange: (id: string) => void;
}

export function AppSidebar({ activeNav, onNavChange }: AppSidebarProps) {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  const navItems: NavItem[] = [
    { id: "general", label: t("navigation.general"), icon: <Info className="w-5 h-5" />, path: "/" },
    { id: "monitor", label: t("navigation.monitor"), icon: <Monitor className="w-5 h-5" />, path: "/monitor", defaultTab: "machine" },
    { id: "transcoder", label: t("navigation.transcoder"), icon: <Video className="w-5 h-5" />, path: "/transcoder", defaultTab: "preset" },
    { id: "channel", label: t("navigation.channel"), icon: <Radio className="w-5 h-5" />, path: "/channel"},
    { id: "profiles", label: t("navigation.profiles"), icon: <Layers className="w-5 h-5" />, path: "/profiles"},
  ];
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const isDark = mounted ? theme === "dark" : true;

  return (
    <aside
      className={cn(
        "relative flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-14 px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Video className="w-5 h-5 text-primary" />
          </div>
          {!collapsed && (
            <span className="font-semibold text-foreground">{t("common.appName")}</span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => (
          <Link
            key={item.id}
            to={item.defaultTab ? `${item.path}/${item.defaultTab}` : item.path}
            className={cn(
              "nav-item w-full",
              activeNav === item.id && "nav-item-active"
            )}
          >
            {item.icon}
            {!collapsed && <span className="text-sm">{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-secondary border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      {/* Footer with User Menu */}
      <div className="p-3 border-t border-sidebar-border">
        <Popover>
          <PopoverTrigger asChild>
            <button
              className={cn(
                "flex items-center gap-3 px-3 py-2 w-full rounded-lg hover:bg-secondary transition-colors",
                collapsed && "justify-center"
              )}
            >
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-foreground truncate">{t("common.admin")}</p>
                  <p className="text-xs text-muted-foreground truncate">{t("common.adminEmail")}</p>
                </div>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-56 p-2" 
            side={collapsed ? "right" : "top"} 
            align={collapsed ? "end" : "start"}
          >
            <div className="space-y-1">
              {/* Settings */}
              <button className="flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg hover:bg-secondary transition-colors text-foreground">
                <Settings className="w-4 h-4" />
                <span>{t("common.settings")}</span>
              </button>

              {/* Language Switcher */}
              <div className="px-3 py-2">
                <LanguageSwitcher />
              </div>

              {/* Theme Toggle */}
              <div className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-3">
                  {isDark ? (
                    <Moon className="w-4 h-4 text-foreground" />
                  ) : (
                    <Sun className="w-4 h-4 text-foreground" />
                  )}
                  <span className="text-sm text-foreground">{t("common.darkMode")}</span>
                </div>
                <Switch
                  checked={isDark}
                  onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </aside>
  );
}
