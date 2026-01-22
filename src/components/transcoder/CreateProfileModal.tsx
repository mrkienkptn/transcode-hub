import { useState } from "react";
import { Check, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";

interface CreateProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Available presets to select from
const availablePresets = [
  { id: "1", name: "H.264 1080p High", codec: "H.264", resolution: "1920x1080" },
  { id: "2", name: "H.264 720p", codec: "H.264", resolution: "1280x720" },
  { id: "3", name: "H.264 480p Mobile", codec: "H.264", resolution: "854x480" },
  { id: "4", name: "H.265 4K HDR", codec: "H.265", resolution: "3840x2160" },
  { id: "5", name: "VP9 720p Web", codec: "VP9", resolution: "1280x720" },
  { id: "6", name: "AV1 1080p Efficient", codec: "AV1", resolution: "1920x1080" },
];

const profileTypes = ["Live", "ABR", "VOD", "Archive"];

interface ProfileFormData {
  name: string;
  type: string;
  selectedPresets: string[];
  videoBitrate: number;
}

const defaultFormData: ProfileFormData = {
  name: "New Profile",
  type: "Live",
  selectedPresets: [],
  videoBitrate: 5000,
};

export function CreateProfileModal({ open, onOpenChange }: CreateProfileModalProps) {
  const [formData, setFormData] = useState<ProfileFormData>(defaultFormData);

  const calculateFileSize = () => {
    if (!formData.videoBitrate) return "0 GB/giờ";
    const gbPerHour = (formData.videoBitrate * 3600) / (8 * 1024 * 1024 * 1024);
    return `~${gbPerHour.toFixed(1)} GB/giờ`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Creating profile:", formData);
    // TODO: Implement actual profile creation
    onOpenChange(false);
    setFormData(defaultFormData);
  };

  const handlePresetToggle = (presetId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedPresets: prev.selectedPresets.includes(presetId)
        ? prev.selectedPresets.filter(id => id !== presetId)
        : [...prev.selectedPresets, presetId]
    }));
  };

  const handleClose = () => {
    onOpenChange(false);
    setFormData(defaultFormData);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col bg-background border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Create Profile</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <form onSubmit={handleSubmit} className="space-y-6 pt-4 pb-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Profile Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="bg-secondary/50 border-border/50"
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger className="bg-secondary/50 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border-border">
                {profileTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preset Selection */}
          <div className="space-y-2">
            <Label>Presets</Label>
            <div className="text-xs text-muted-foreground mb-2">
              Select presets to include in this profile ({formData.selectedPresets.length} selected)
            </div>
            <ScrollArea className="h-[200px] rounded-md border border-border/50 bg-secondary/30">
              <div className="p-3 space-y-2">
                {availablePresets.map((preset) => {
                  const isSelected = formData.selectedPresets.includes(preset.id);
                  return (
                    <div
                      key={preset.id}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors
                        ${isSelected 
                          ? "bg-primary/10 border border-primary/30" 
                          : "bg-secondary/50 border border-transparent hover:bg-secondary"
                        }`}
                      onClick={() => handlePresetToggle(preset.id)}
                    >
                      <div className={`h-4 w-4 rounded border flex items-center justify-center
                        ${isSelected 
                          ? "bg-primary border-primary" 
                          : "border-muted-foreground"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{preset.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {preset.codec} • {preset.resolution}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          <Separator />

          {/* Video Bitrate */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold">Video Settings</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="bitrate">Bitrate (kbps):</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{formData.videoBitrate.toLocaleString()}</span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span>{calculateFileSize()}</span>
                    <Info className="w-3 h-3" />
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <Slider
                  id="bitrate"
                  min={1000}
                  max={50000}
                  step={500}
                  value={[formData.videoBitrate]}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, videoBitrate: value[0] }))
                  }
                  className="w-full"
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>1,000 kbps</span>
                  <span>50,000 kbps</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1000}
                  max={50000}
                  step={500}
                  value={formData.videoBitrate}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 1000;
                    const clampedValue = Math.min(Math.max(1000, value), 50000);
                    setFormData((prev) => ({ ...prev, videoBitrate: clampedValue }));
                  }}
                  className="w-32 bg-secondary/50 border-border/50"
                />
                <span className="text-sm text-muted-foreground">kbps</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">
              Create Profile
            </Button>
          </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
