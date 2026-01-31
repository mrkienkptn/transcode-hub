import { MachineMetrics } from "@/components/monitor/MachineMetrics";
import { ChannelMetrics } from "@/components/monitor/ChannelMetrics";

interface MonitorViewProps {
  activeTab: string;
}

export function MonitorView({ activeTab }: MonitorViewProps) {
  return (
    <div className="animate-slide-in">
      {activeTab === "channels" && <ChannelMetrics />}
      {activeTab === "machine" && <MachineMetrics />}
    </div>
  );
}
