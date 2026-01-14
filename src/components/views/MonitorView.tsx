import { MachineMetrics } from "@/components/monitor/MachineMetrics";
import { ChannelMetrics } from "@/components/monitor/ChannelMetrics";

interface MonitorViewProps {
  activeTab: string;
}

export function MonitorView({ activeTab }: MonitorViewProps) {
  return (
    <div className="animate-slide-in">
      {activeTab === "machine" && <MachineMetrics />}
      {activeTab === "channels" && <ChannelMetrics />}
    </div>
  );
}
