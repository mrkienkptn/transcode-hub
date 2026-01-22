import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AppSidebar } from "./AppSidebar";
import { TopTaskbar } from "./TopTaskbar";
import { GeneralView } from "@/components/views/GeneralView";
import { MonitorView } from "@/components/views/MonitorView";
import { TranscoderView } from "@/components/views/TranscoderView";
import { ChannelView } from "@/components/views/ChannelView";
import { ProfileView } from "@/components/views/ProfileView";

interface TabConfig {
  tabs: { id: string; label: string }[];
  defaultTab: string;
  title: string;
  path: string;
}

function getActiveNavFromPath(pathname: string): string {
  if (pathname.startsWith("/monitor")) return "monitor";
  if (pathname.startsWith("/transcoder")) return "transcoder";
  if (pathname.startsWith("/channel")) return "channel";
  if (pathname.startsWith("/profiles")) return "profiles";
  return "general";
}

export function MainLayout() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { tab } = useParams<{ tab?: string }>();

  const tabConfigs: Record<string, TabConfig> = {
    general: {
      tabs: [],
      defaultTab: "",
      title: t("navigation.general"),
      path: "/",
    },
    monitor: {
      tabs: [
        { id: "machine", label: t("tabs.machine") },
        { id: "channels", label: t("tabs.channels") },
      ],
      defaultTab: "machine",
      title: t("navigation.monitor"),
      path: "/monitor",
    },
    transcoder: {
      tabs: [
        { id: "preset", label: t("tabs.preset") },
        { id: "profile", label: t("tabs.profile") },
      ],
      defaultTab: "preset",
      title: t("navigation.transcoder"),
      path: "/transcoder",
    },
    channel: {
      tabs: [],
      defaultTab: "",
      title: t("navigation.channel"),
      path: "/channel"
    },
    profiles: {
      tabs: [],
      defaultTab: "",
      title: t("navigation.profiles"),
      path: "/profiles"
    }
  };

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
      case "profiles":
        return <ProfileView />;
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
