import { useState } from "react";
import { Plus, Trash2, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface CreateChannelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Mock data - replace with actual data
const mockInputs = [
  { id: "1", name: "Primary RTMP", uri: "rtmp://input.stream/live" },
  { id: "2", name: "Backup SRT", uri: "srt://192.168.1.50:9000" },
  { id: "3", name: "UDP Multicast", uri: "udp://239.0.0.1:5000" },
  { id: "4", name: "File Input", uri: "file:///media/content.mp4" },
];

const mockProfiles = [
  { 
    id: "1", 
    name: "Broadcast Standard",
    presets: [
      { id: "p1", name: "1080p60 H.264", codec: "H.264", resolution: "1920x1080" },
      { id: "p2", name: "720p30 H.264", codec: "H.264", resolution: "1280x720" },
    ]
  },
  { 
    id: "2", 
    name: "OTT Adaptive",
    presets: [
      { id: "p3", name: "4K HEVC", codec: "HEVC", resolution: "3840x2160" },
      { id: "p4", name: "1080p HEVC", codec: "HEVC", resolution: "1920x1080" },
      { id: "p5", name: "720p HEVC", codec: "HEVC", resolution: "1280x720" },
      { id: "p6", name: "480p HEVC", codec: "HEVC", resolution: "854x480" },
    ]
  },
  { 
    id: "3", 
    name: "Social Media Package",
    presets: [
      { id: "p7", name: "Square 1080p", codec: "H.264", resolution: "1080x1080" },
      { id: "p8", name: "Vertical 1080p", codec: "H.264", resolution: "1080x1920" },
    ]
  },
];

const formatTypes = ["RTMP", "HLS", "DASH", "UDP", "RTP", "SRT", "FILE"];

const defaultUriByFormat: Record<string, string> = {
  RTMP: "rtmp://output.stream/live",
  HLS: "http://cdn.example.com/hls/stream.m3u8",
  DASH: "http://cdn.example.com/dash/stream.mpd",
  UDP: "udp://239.0.0.100:5000",
  RTP: "rtp://239.0.0.100:5004",
  SRT: "srt://output.server:9000",
  FILE: "file:///output/recording.ts",
};

interface Target {
  id: string;
  format: string;
  outputUri: string;
  selectedPresets: string[];
}

interface ChannelFormData {
  name: string;
  mainInputId: string;
  mainInputUri: string;
  backupInputId: string;
  backupInputUri: string;
  profileId: string;
  targets: Target[];
}

const defaultFormData: ChannelFormData = {
  name: "New Channel",
  mainInputId: mockInputs[0]?.id || "",
  mainInputUri: mockInputs[0]?.uri || "",
  backupInputId: "",
  backupInputUri: "",
  profileId: mockProfiles[0]?.id || "",
  targets: [],
};

export function CreateChannelModal({ open, onOpenChange }: CreateChannelModalProps) {
  const [formData, setFormData] = useState<ChannelFormData>(defaultFormData);

  const selectedProfile = mockProfiles.find(p => p.id === formData.profileId);

  const handleClose = () => {
    setFormData(defaultFormData);
    onOpenChange(false);
  };

  const handleMainInputSelect = (inputId: string) => {
    const input = mockInputs.find(i => i.id === inputId);
    setFormData(prev => ({
      ...prev,
      mainInputId: inputId,
      mainInputUri: input?.uri || "",
    }));
  };

  const handleBackupInputSelect = (inputId: string) => {
    const input = mockInputs.find(i => i.id === inputId);
    setFormData(prev => ({
      ...prev,
      backupInputId: inputId,
      backupInputUri: input?.uri || "",
    }));
  };

  const handleProfileSelect = (profileId: string) => {
    // Reset targets when profile changes (presets may be different)
    setFormData(prev => ({
      ...prev,
      profileId,
      targets: prev.targets.map(t => ({ ...t, selectedPresets: [] })),
    }));
  };

  const addTarget = () => {
    const newTarget: Target = {
      id: crypto.randomUUID(),
      format: "RTMP",
      outputUri: defaultUriByFormat["RTMP"],
      selectedPresets: [],
    };
    setFormData(prev => ({
      ...prev,
      targets: [...prev.targets, newTarget],
    }));
  };

  const removeTarget = (targetId: string) => {
    setFormData(prev => ({
      ...prev,
      targets: prev.targets.filter(t => t.id !== targetId),
    }));
  };

  const updateTarget = (targetId: string, updates: Partial<Target>) => {
    setFormData(prev => ({
      ...prev,
      targets: prev.targets.map(t => 
        t.id === targetId ? { ...t, ...updates } : t
      ),
    }));
  };

  const handleTargetFormatChange = (targetId: string, format: string) => {
    updateTarget(targetId, { 
      format, 
      outputUri: defaultUriByFormat[format] || "" 
    });
  };

  const togglePresetForTarget = (targetId: string, presetId: string) => {
    setFormData(prev => ({
      ...prev,
      targets: prev.targets.map(t => {
        if (t.id !== targetId) return t;
        const isSelected = t.selectedPresets.includes(presetId);
        return {
          ...t,
          selectedPresets: isSelected
            ? t.selectedPresets.filter(p => p !== presetId)
            : [...t.selectedPresets, presetId],
        };
      }),
    }));
  };

  const handleSubmit = () => {
    console.log("Creating channel:", formData);
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New Channel</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 pb-4">
            {/* Channel Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Channel Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter channel name"
              />
            </div>

            <Separator />

            {/* Input Section */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Input</Label>
              
              {/* Main Input */}
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Main URI</Label>
                <div className="flex gap-2">
                  <Select value={formData.mainInputId} onValueChange={handleMainInputSelect}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select input" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockInputs.map(input => (
                        <SelectItem key={input.id} value={input.id}>
                          {input.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    className="flex-1"
                    value={formData.mainInputUri}
                    onChange={(e) => setFormData(prev => ({ ...prev, mainInputUri: e.target.value }))}
                    placeholder="Input URI"
                  />
                </div>
              </div>

              {/* Backup Input */}
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Backup URI</Label>
                <div className="flex gap-2">
                  <Select value={formData.backupInputId} onValueChange={handleBackupInputSelect}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select input" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {mockInputs.map(input => (
                        <SelectItem key={input.id} value={input.id}>
                          {input.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    className="flex-1"
                    value={formData.backupInputUri}
                    onChange={(e) => setFormData(prev => ({ ...prev, backupInputUri: e.target.value }))}
                    placeholder="Backup URI (optional)"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Profile Selection */}
            <div className="space-y-2">
              <Label>Profile</Label>
              <Select value={formData.profileId} onValueChange={handleProfileSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select profile" />
                </SelectTrigger>
                <SelectContent>
                  {mockProfiles.map(profile => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.name} ({profile.presets.length} presets)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Targets Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Targets</Label>
                <Button variant="outline" size="sm" onClick={addTarget} className="gap-1">
                  <Plus className="w-3 h-3" />
                  Add Target
                </Button>
              </div>

              {formData.targets.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm border border-dashed rounded-lg">
                  No targets added. Click "Add Target" to create one.
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.targets.map((target, index) => (
                    <div 
                      key={target.id} 
                      className="p-4 rounded-lg border bg-secondary/30 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Target {index + 1}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-destructive"
                          onClick={() => removeTarget(target.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Format & Output URI */}
                      <div className="flex gap-2">
                        <Select 
                          value={target.format} 
                          onValueChange={(v) => handleTargetFormatChange(target.id, v)}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {formatTypes.map(format => (
                              <SelectItem key={format} value={format}>
                                {format}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          className="flex-1"
                          value={target.outputUri}
                          onChange={(e) => updateTarget(target.id, { outputUri: e.target.value })}
                          placeholder="Output URI"
                        />
                      </div>

                      {/* Preset Selection */}
                      {selectedProfile && selectedProfile.presets.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Presets</Label>
                          <div className="flex flex-wrap gap-2">
                            {selectedProfile.presets.map(preset => {
                              const isSelected = target.selectedPresets.includes(preset.id);
                              return (
                                <div
                                  key={preset.id}
                                  onClick={() => togglePresetForTarget(target.id, preset.id)}
                                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer transition-colors text-xs
                                    ${isSelected 
                                      ? "bg-primary/20 border border-primary/50 text-primary" 
                                      : "bg-secondary border border-transparent hover:bg-secondary/80"
                                    }`}
                                >
                                  {isSelected && <Check className="w-3 h-3" />}
                                  <span>{preset.name}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Create Channel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
