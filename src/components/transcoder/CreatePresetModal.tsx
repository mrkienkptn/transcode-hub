import { useState } from "react";
import { X } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CreatePresetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PresetFormData {
  name: string;
  codec: string;
  bitrate: string;
  width: string;
  height: string;
  framerate: string;
  type: "video" | "audio" | "data";
  encoderType: "CPU" | "GPU";
}

const defaultFormData: PresetFormData = {
  name: "New Preset",
  codec: "H.264",
  bitrate: "8000",
  width: "1920",
  height: "1080",
  framerate: "30",
  type: "video",
  encoderType: "CPU",
};

const codecOptions = ["H.264", "H.265", "VP9", "AV1", "AAC", "Opus"];
const typeOptions = ["video", "audio", "data"] as const;
const encoderOptions = ["CPU", "GPU"] as const;

export function CreatePresetModal({ open, onOpenChange }: CreatePresetModalProps) {
  const [formData, setFormData] = useState<PresetFormData>(defaultFormData);

  const handleChange = (field: keyof PresetFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Creating preset:", formData);
    // TODO: Submit to API
    onOpenChange(false);
    setFormData(defaultFormData);
  };

  const handleClose = () => {
    onOpenChange(false);
    setFormData(defaultFormData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-background border-border">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Create New Preset</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Preset Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Enter preset name"
              className="bg-secondary/30 border-border/50"
            />
          </div>

          {/* Type & Encoder Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={formData.type} onValueChange={(v) => handleChange("type", v)}>
                <SelectTrigger className="bg-secondary/30 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border-border">
                  {typeOptions.map((type) => (
                    <SelectItem key={type} value={type} className="capitalize">
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Encoder Type</Label>
              <Select value={formData.encoderType} onValueChange={(v) => handleChange("encoderType", v)}>
                <SelectTrigger className="bg-secondary/30 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border-border">
                  {encoderOptions.map((encoder) => (
                    <SelectItem key={encoder} value={encoder}>
                      {encoder}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Codec */}
          <div className="space-y-2">
            <Label>Codec</Label>
            <Select value={formData.codec} onValueChange={(v) => handleChange("codec", v)}>
              <SelectTrigger className="bg-secondary/30 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border-border">
                {codecOptions.map((codec) => (
                  <SelectItem key={codec} value={codec}>
                    {codec}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bitrate */}
          <div className="space-y-2">
            <Label htmlFor="bitrate">Bitrate (kbps)</Label>
            <Input
              id="bitrate"
              type="number"
              value={formData.bitrate}
              onChange={(e) => handleChange("bitrate", e.target.value)}
              placeholder="8000"
              className="bg-secondary/30 border-border/50"
            />
          </div>

          {/* Resolution */}
          <div className="space-y-2">
            <Label>Resolution</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Input
                  type="number"
                  value={formData.width}
                  onChange={(e) => handleChange("width", e.target.value)}
                  placeholder="Width"
                  className="bg-secondary/30 border-border/50"
                />
                <span className="text-xs text-muted-foreground mt-1 block">Width</span>
              </div>
              <div>
                <Input
                  type="number"
                  value={formData.height}
                  onChange={(e) => handleChange("height", e.target.value)}
                  placeholder="Height"
                  className="bg-secondary/30 border-border/50"
                />
                <span className="text-xs text-muted-foreground mt-1 block">Height</span>
              </div>
            </div>
          </div>

          {/* Framerate */}
          <div className="space-y-2">
            <Label htmlFor="framerate">Framerate (fps)</Label>
            <Input
              id="framerate"
              type="number"
              value={formData.framerate}
              onChange={(e) => handleChange("framerate", e.target.value)}
              placeholder="30"
              className="bg-secondary/30 border-border/50"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">Create Preset</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
