import { useState } from "react";
import { Plus, Search, Settings2, Trash2, Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CreateProfileModal } from "./CreateProfileModal";
const profiles = [
  { 
    id: 1, 
    name: "Broadcast Standard", 
    presets: ["H.264 1080p High", "H.264 720p"],
    outputs: 2,
    type: "Live",
    status: "active" 
  },
  { 
    id: 2, 
    name: "OTT Adaptive", 
    presets: ["H.265 4K HDR", "H.264 1080p High", "H.264 720p", "H.264 480p Mobile"],
    outputs: 4,
    type: "ABR",
    status: "active" 
  },
  { 
    id: 3, 
    name: "Social Media Package", 
    presets: ["H.264 1080p High", "VP9 720p Web"],
    outputs: 2,
    type: "VOD",
    status: "active" 
  },
  { 
    id: 4, 
    name: "Archive Quality", 
    presets: ["AV1 1080p Efficient"],
    outputs: 1,
    type: "Archive",
    status: "draft" 
  },
];

export function ProfileManager() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search profiles..." 
            className="pl-10 bg-secondary/50 border-border/50"
          />
        </div>
        <Button className="gap-2" onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4" />
          New Profile
        </Button>
      </div>

      {/* Profiles List */}
      <div className="space-y-4">
        {profiles.map((profile) => (
          <Card key={profile.id} className="glass-card group hover:border-primary/30 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-lg bg-primary/10">
                    <Layers className="w-5 h-5 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-foreground">{profile.name}</h3>
                      <Badge 
                        variant={profile.status === "active" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {profile.status}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {profile.type}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.presets.map((preset) => (
                        <span 
                          key={preset}
                          className="px-2 py-0.5 text-xs bg-secondary rounded-md text-muted-foreground"
                        >
                          {preset}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {profile.outputs} output{profile.outputs > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Settings2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <CreateProfileModal open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  );
}
