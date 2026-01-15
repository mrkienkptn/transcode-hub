import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { TopTaskbar } from "./TopTaskbar";
import { GeneralView } from "@/components/views/GeneralView";
import { MonitorView } from "@/components/views/MonitorView";
import { TranscoderView } from "@/components/views/TranscoderView";
import { ChannelView } from '@/components/views/ChannelView'
import { channel } from "diagnostics_channel";

interface TabConfig {
  tabs: { id: string; label: string }[];
  defaultTab: string;
  title: string;
  path: string;
}

const tabConfigs: Record<string, TabConfig> = {
  general: {
    tabs: [],
    defaultTab: "",
    title: "General",
    path: "/",
  },
  monitor: {
    tabs: [
      { id: "machine", label: "Machine" },
      { id: "channels", label: "Transcode Channels" },
    ],
    defaultTab: "machine",
    title: "Monitor",
    path: "/monitor",
  },
  transcoder: {
    tabs: [
      { id: "preset", label: "Preset" },
      { id: "profile", label: "Profile" },
    ],
    defaultTab: "preset",
    title: "Transcoder",
    path: "/transcoder",
  },
  channel: {
    tabs: [],
    defaultTab: "",
    title: "Channel",
    path: "/channel"
  }
};

function getActiveNavFromPath(pathname: string): string {
  if (pathname.startsWith("/monitor")) return "monitor";
  if (pathname.startsWith("/transcoder")) return "transcoder";
  if (pathname.startsWith("/channel")) return "channel";
  return "general";
}

export function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { tab } = useParams<{ tab?: string }>();

  const activeNav = getActiveNavFromPath(location.pathname);
  const currentConfig = tabConfigs[activeNav];
  
  // Use tab from URL params, or default tab
  const currentTab = tab || currentConfig.defaultTab;

  const handleNavChange = (navId: string) => {
    const config = tabConfigs[navId];
    if (config.tabs.length > 0) {
      navigate(`${config.path}/${config.defaultTab}`);
    } else {
      navigate(config.path);
    }
  };

  const handleTabChange = (tabId: string) => {
    navigate(`${currentConfig.path}/${tabId}`);
  };

  const renderContent = () => {
    switch (activeNav) {
      case "general":
        return <GeneralView />;
      case "monitor":
        return <MonitorView activeTab={currentTab} />;
      case "transcoder":
        return <TranscoderView activeTab={currentTab} />;
      case "channel":
        return <ChannelView />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar activeNav={activeNav} onNavChange={handleNavChange} />
      
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
