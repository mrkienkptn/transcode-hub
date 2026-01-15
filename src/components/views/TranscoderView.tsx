import { PresetManager } from "@/components/transcoder/PresetManager";
import { ProfileManager } from "@/components/transcoder/ProfileManager";

interface TranscoderViewProps {
  activeTab: string;
}

export function TranscoderView({ activeTab }: TranscoderViewProps) {
  return (
    <div className="animate-slide-in">
      {activeTab === "preset" && <PresetManager />}
      {activeTab === "profile" && <ProfileManager />}
    </div>
  );
}
