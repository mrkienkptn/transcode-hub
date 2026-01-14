import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
}

interface TopTaskbarProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  title: string;
}

export function TopTaskbar({ tabs, activeTab, onTabChange, title }: TopTaskbarProps) {
  return (
    <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6">
      <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      
      {tabs.length > 0 && (
        <div className="flex items-center gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "taskbar-tab",
                activeTab === tab.id && "taskbar-tab-active"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
