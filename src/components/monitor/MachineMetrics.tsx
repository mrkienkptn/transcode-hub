import { Cpu, MemoryStick, MonitorPlay, Network, HardDrive } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricChart } from "./MetricChart";

const generateMetricData = (baseValue: number, variance: number) => {
  return Array.from({ length: 24 }, (_, i) => ({
    time: `${String(i).padStart(2, "0")}:00`,
    value: Math.max(0, Math.min(100, baseValue + (Math.random() - 0.5) * variance)),
  }));
};

const metrics = [
  {
    id: "cpu",
    label: "CPU Usage",
    icon: Cpu,
    value: 47,
    unit: "%",
    color: "hsl(var(--chart-1))",
    data: generateMetricData(45, 30),
  },
  {
    id: "ram",
    label: "Memory Usage",
    icon: MemoryStick,
    value: 62,
    unit: "%",
    color: "hsl(var(--chart-2))",
    data: generateMetricData(60, 20),
  },
  {
    id: "gpu",
    label: "GPU Usage",
    icon: MonitorPlay,
    value: 78,
    unit: "%",
    color: "hsl(var(--chart-3))",
    data: generateMetricData(75, 25),
  },
  {
    id: "network",
    label: "Network I/O",
    icon: Network,
    value: 2.4,
    unit: "Gbps",
    color: "hsl(var(--chart-4))",
    data: generateMetricData(50, 40),
  },
  {
    id: "disk",
    label: "Disk I/O",
    icon: HardDrive,
    value: 156,
    unit: "MB/s",
    color: "hsl(var(--chart-5))",
    data: generateMetricData(40, 35),
  },
];

export function MachineMetrics() {
  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {metrics.map((metric) => (
          <Card key={metric.id} className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <metric.icon 
                  className="w-5 h-5" 
                  style={{ color: metric.color }} 
                />
                <span 
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{ 
                    backgroundColor: `${metric.color}20`,
                    color: metric.color 
                  }}
                >
                  {metric.value}{metric.unit}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{metric.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => (
          <Card key={metric.id} className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <metric.icon 
                  className="w-4 h-4" 
                  style={{ color: metric.color }} 
                />
                {metric.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MetricChart 
                data={metric.data} 
                color={metric.color}
                unit={metric.unit}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
