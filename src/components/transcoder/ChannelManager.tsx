import { Plus, Search, Play, Pause, Square, Settings2, Trash2, Radio } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// TODO: Replace with actual API call
const mockChannels = [
  { id: 1, name: "Channel 1 - Sports", input: "rtmp://input.stream/sports", profile: "Broadcast Standard", status: "running", bitrate: "8.2 Mbps", uptime: "4h 32m" },
  { id: 2, name: "Channel 2 - News", input: "srt://192.168.1.50:9000", profile: "OTT Adaptive", status: "running", bitrate: "24.5 Mbps", uptime: "12h 15m" },
  { id: 3, name: "Channel 3 - Entertainment", input: "rtmp://input.stream/ent", profile: "Social Media Package", status: "idle", bitrate: "0 Mbps", uptime: "-" },
  { id: 4, name: "Channel 4 - Music", input: "udp://239.0.0.1:5000", profile: "Broadcast Standard", status: "running", bitrate: "7.8 Mbps", uptime: "2h 45m" },
  { id: 5, name: "Channel 5 - Archive", input: "file:///media/archive/show.mp4", profile: "Archive Quality", status: "error", bitrate: "0 Mbps", uptime: "-" },
];

const statusConfig = {
  running: { color: "bg-success", label: "Running", icon: Play },
  idle: { color: "bg-warning", label: "Idle", icon: Pause },
  error: { color: "bg-destructive", label: "Error", icon: Square },
};

export function ChannelManager() {
  const [searchParams, setSearchParams] = useSearchParams();
  const nameFilter = searchParams.get("name") || "";

  const handleSearchChange = (value: string) => {
    if (value) {
      setSearchParams({ name: value });
    } else {
      setSearchParams({});
    }
  };

  // Filter channels based on URL search param
  const filteredChannels = mockChannels.filter((channel) =>
    channel.name.toLowerCase().includes(nameFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search channels..." 
            className="pl-10 bg-secondary/50 border-border/50"
            value={nameFilter}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Channel
        </Button>
      </div>

      {/* Channels Table */}
      <Card className="glass-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Channel</TableHead>
                <TableHead className="text-muted-foreground hidden md:table-cell">Input</TableHead>
                <TableHead className="text-muted-foreground hidden lg:table-cell">Profile</TableHead>
                <TableHead className="text-muted-foreground text-right">Bitrate</TableHead>
                <TableHead className="text-muted-foreground text-right hidden sm:table-cell">Uptime</TableHead>
                <TableHead className="text-muted-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredChannels.map((channel) => {
                const status = statusConfig[channel.status as keyof typeof statusConfig];
                return (
                  <TableRow key={channel.id} className="border-border/30 hover:bg-secondary/30">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${status.color} ${channel.status === "running" ? "animate-pulse-glow" : ""}`} />
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${channel.status === "error" ? "border-destructive text-destructive" : ""}`}
                        >
                          {status.label}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Radio className="w-4 h-4 text-primary" />
                        <span className="font-medium">{channel.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <code className="text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded">
                        {channel.input.length > 35 ? `${channel.input.slice(0, 35)}...` : channel.input}
                      </code>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {channel.profile}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {channel.bitrate}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm text-muted-foreground hidden sm:table-cell">
                      {channel.uptime}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {channel.status === "running" ? (
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Pause className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Play className="w-4 h-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Settings2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
