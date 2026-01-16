import { useState } from "react";
import { Plus, Search, Settings2, Trash2, Copy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CreatePresetModal } from "./CreatePresetModal";

const presets = [
  { id: 1, name: "H.264 1080p High", codec: "H.264", resolution: "1920x1080", bitrate: "8 Mbps", fps: 30, status: "active" },
  { id: 2, name: "H.265 4K HDR", codec: "H.265", resolution: "3840x2160", bitrate: "25 Mbps", fps: 60, status: "active" },
  { id: 3, name: "VP9 720p Web", codec: "VP9", resolution: "1280x720", bitrate: "4 Mbps", fps: 30, status: "active" },
  { id: 4, name: "AV1 1080p Efficient", codec: "AV1", resolution: "1920x1080", bitrate: "6 Mbps", fps: 30, status: "draft" },
  { id: 5, name: "H.264 480p Mobile", codec: "H.264", resolution: "854x480", bitrate: "2 Mbps", fps: 30, status: "active" },
];

export function PresetManager() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search presets..." 
            className="pl-10 bg-secondary/50 border-border/50"
          />
        </div>
        <Button className="gap-2" onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4" />
          New Preset
        </Button>
      </div>

      {/* Create Preset Modal */}
      <CreatePresetModal open={isCreateOpen} onOpenChange={setIsCreateOpen} />

      {/* Presets Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {presets.map((preset) => (
          <Card key={preset.id} className="glass-card group hover:border-primary/30 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-sm font-medium">{preset.name}</CardTitle>
                  <Badge 
                    variant={preset.status === "active" ? "default" : "secondary"}
                    className="mt-1.5 text-xs"
                  >
                    {preset.status}
                  </Badge>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Settings2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="metric-label">Codec</p>
                  <p className="font-mono text-foreground">{preset.codec}</p>
                </div>
                <div>
                  <p className="metric-label">Resolution</p>
                  <p className="font-mono text-foreground">{preset.resolution}</p>
                </div>
                <div>
                  <p className="metric-label">Bitrate</p>
                  <p className="font-mono text-foreground">{preset.bitrate}</p>
                </div>
                <div>
                  <p className="metric-label">Frame Rate</p>
                  <p className="font-mono text-foreground">{preset.fps} fps</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
