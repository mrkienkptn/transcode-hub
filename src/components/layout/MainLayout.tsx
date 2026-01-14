import { useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { TopTaskbar } from "./TopTaskbar";
import { GeneralView } from "@/components/views/GeneralView";
import { MonitorView } from "@/components/views/MonitorView";
import { TranscoderView } from "@/components/views/TranscoderView";

interface TabConfig {
  tabs: { id: string; label: string }[];
  defaultTab: string;
  title: string;
}

const tabConfigs: Record<string, TabConfig> = {
  general: {
    tabs: [],
    defaultTab: "",
    title: "General",
  },
  monitor: {
    tabs: [
      { id: "machine", label: "Machine" },
      { id: "channels", label: "Transcode Channels" },
    ],
    defaultTab: "machine",
    title: "Monitor",
  },
  transcoder: {
    tabs: [
      { id: "preset", label: "Preset" },
      { id: "profile", label: "Profile" },
      { id: "channel", label: "Channel" },
    ],
    defaultTab: "preset",
    title: "Transcoder",
  },
};

export function MainLayout() {
  const [activeNav, setActiveNav] = useState("general");
  const [activeTabs, setActiveTabs] = useState<Record<string, string>>({
    monitor: "machine",
    transcoder: "preset",
  });

  const currentConfig = tabConfigs[activeNav];
  const currentTab = activeTabs[activeNav] || currentConfig.defaultTab;

  const handleTabChange = (tabId: string) => {
    setActiveTabs((prev) => ({
      ...prev,
      [activeNav]: tabId,
    }));
  };

  const renderContent = () => {
    switch (activeNav) {
      case "general":
        return <GeneralView />;
      case "monitor":
        return <MonitorView activeTab={currentTab} />;
      case "transcoder":
        return <TranscoderView activeTab={currentTab} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar activeNav={activeNav} onNavChange={setActiveNav} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <TopTaskbar
          tabs={currentConfig.tabs}
          activeTab={currentTab}
          onTabChange={handleTabChange}
          title={currentConfig.title}
        />
        
        <main className="flex-1 overflow-auto p-6 scrollbar-thin">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
