import { useState, useEffect } from "react";
import { Trash2, Save, Info, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Profile } from "./ProfileManager";

interface CreateProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile?: Profile | null;
  onSave: (profile: Profile) => void;
  onDelete?: () => void;
}

const videoCodecs = [
  { value: "libx264", label: "H.264 (libx264)" },
  { value: "hevc_nvenc", label: "HEVC (NVIDIA NVENC)" },
  { value: "h264_nvenc", label: "NVIDIA NVENC H.264" },
  { value: "libx265", label: "HEVC (libx265)" },
];

const audioCodecs = [
  { value: "aac", label: "AAC" },
  { value: "mp3", label: "MP3" },
  { value: "opus", label: "Opus" },
];

const audioBitrates = [
  { value: "128", label: "128k" },
  { value: "192", label: "192k" },
  { value: "256", label: "256k" },
  { value: "320", label: "320k" },
];

const fpsOptions = [24, 30, 60, 120];

const defaultProfile: Partial<Profile> = {
  name: "",
  codec: "libx264",
  width: 1920,
  height: 1080,
  fps: 30,
  video_bitrate: 5000,
  gop_size: 60,
  preset: "veryfast",
  profile: "main",
  audio_codec: "aac",
  audio_bitrate: 128,
  sample_rate: 44100,
  is_active: true,
};

type ProfileFormData = Partial<Profile> & {
  description?: string;
};

export function CreateProfileModal({
  open,
  onOpenChange,
  profile,
  onSave,
  onDelete,
}: CreateProfileModalProps) {
  const [formData, setFormData] = useState<ProfileFormData>(defaultProfile);
  const [lockRatio, setLockRatio] = useState(true);
  const [aspectRatio, setAspectRatio] = useState(16 / 9);

  // Initialize form data when profile changes
  useEffect(() => {
    if (profile) {
      setFormData({
        ...defaultProfile,
        ...profile,
      });
      if (profile.width && profile.height) {
        setAspectRatio(profile.width / profile.height);
      }
    } else {
      setFormData(defaultProfile);
      setAspectRatio(16 / 9);
    }
  }, [profile, open]);

  const handleClose = () => {
    setFormData(defaultProfile);
    setLockRatio(true);
    setAspectRatio(16 / 9);
    onOpenChange(false);
  };

  const handleWidthChange = (value: string) => {
    const width = parseInt(value) || 0;
    setFormData((prev) => {
      const newData = { ...prev, width };
      if (lockRatio && prev.height) {
        newData.height = Math.round(width / aspectRatio);
      }
      return newData;
    });
  };

  const handleHeightChange = (value: string) => {
    const height = parseInt(value) || 0;
    setFormData((prev) => {
      const newData = { ...prev, height };
      if (lockRatio && prev.width) {
        newData.width = Math.round(height * aspectRatio);
      } else if (prev.width) {
        setAspectRatio(prev.width / height);
      }
      return newData;
    });
  };

  const handleRatioToggle = (checked: boolean) => {
    setLockRatio(checked);
    if (checked && formData.width && formData.height) {
      setAspectRatio(formData.width / formData.height);
    }
  };

  const calculateFileSize = () => {
    if (!formData.video_bitrate || !formData.audio_bitrate) return "0 GB/giờ";
    const totalBitrate = formData.video_bitrate + formData.audio_bitrate;
    const gbPerHour = (totalBitrate * 3600) / (8 * 1024 * 1024 * 1024);
    return `~${gbPerHour.toFixed(1)} GB/giờ`;
  };

  const handleSubmit = () => {
    if (!formData.name) {
      return;
    }
    onSave(formData as Profile);
    handleClose();
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
      handleClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {profile ? "Chỉnh sửa Profile" : "Tạo Profile Mới"}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 pb-4">
            {/* ĐANG SỬA Header */}
            {profile && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground pb-2 border-b border-border/50">
                <Pencil className="w-4 h-4" />
                <span>ĐANG SỬA: {profile.name}</span>
              </div>
            )}

            {/* 1. THÔNG TIN CHUNG */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold">1. THÔNG TIN CHUNG</h3>
              
              <div className="space-y-2">
                <Label htmlFor="name">Tên Profile:</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="VD: 2K QHD Gaming"
                  maxLength={50}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Mô tả:</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Dành cho stream Game..."
                  rows={3}
                />
              </div>
            </div>

            <Separator />

            {/* 2. VIDEO SETTINGS */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold">2. VIDEO SETTINGS</h3>

              <div className="space-y-2">
                <Label htmlFor="codec">Codec:</Label>
                <Select
                  value={formData.codec || "libx264"}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, codec: value }))
                  }
                >
                  <SelectTrigger id="codec">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {videoCodecs.map((codec) => (
                      <SelectItem key={codec.value} value={codec.value}>
                        {codec.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Resolution (W x H):</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={formData.width || ""}
                    onChange={(e) => handleWidthChange(e.target.value)}
                    placeholder="1920"
                    className="w-24"
                  />
                  <span className="text-muted-foreground">x</span>
                  <Input
                    type="number"
                    value={formData.height || ""}
                    onChange={(e) => handleHeightChange(e.target.value)}
                    placeholder="1080"
                    className="w-24"
                  />
                  <div className="flex items-center gap-2 ml-2">
                    <Switch
                      checked={lockRatio}
                      onCheckedChange={handleRatioToggle}
                      id="lock-ratio"
                    />
                    <Label htmlFor="lock-ratio" className="text-xs cursor-pointer">
                      Ratio
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bitrate">Bitrate (kbps):</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="bitrate"
                    type="number"
                    min={1000}
                    max={50000}
                    step={500}
                    value={formData.video_bitrate || ""}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 1000;
                      const clampedValue = Math.min(Math.max(1000, value), 50000);
                      setFormData((prev) => ({
                        ...prev,
                        video_bitrate: clampedValue,
                      }));
                    }}
                    placeholder="5000"
                    className="w-32"
                  />
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <span>{calculateFileSize()}</span>
                    <Info className="w-4 h-4" />
                  </div>
                </div>
                <div className="space-y-3 pt-2">
                  <Slider
                    min={1000}
                    max={50000}
                    step={500}
                    value={[formData.video_bitrate || 5000]}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        video_bitrate: value[0],
                      }))
                    }
                    className="w-full"
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>1,000 kbps</span>
                    <span>50,000 kbps</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fps">FPS:</Label>
                  <Select
                    value={String(formData.fps || 30)}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        fps: parseInt(value),
                      }))
                    }
                  >
                    <SelectTrigger id="fps">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fpsOptions.map((fps) => (
                        <SelectItem key={fps} value={String(fps)}>
                          {fps}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gop">GOP Size:</Label>
                  <Input
                    id="gop"
                    type="number"
                    value={formData.gop_size || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        gop_size: parseInt(e.target.value) || 0,
                      }))
                    }
                    placeholder="60"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* 3. AUDIO SETTINGS */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold">3. AUDIO SETTINGS</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="audio-codec">Codec:</Label>
                  <Select
                    value={formData.audio_codec || "aac"}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, audio_codec: value }))
                    }
                  >
                    <SelectTrigger id="audio-codec">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {audioCodecs.map((codec) => (
                        <SelectItem key={codec.value} value={codec.value}>
                          {codec.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="audio-bitrate">Bitrate:</Label>
                  <Select
                    value={String(formData.audio_bitrate || 128)}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        audio_bitrate: parseInt(value),
                      }))
                    }
                  >
                    <SelectTrigger id="audio-bitrate">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {audioBitrates.map((bitrate) => (
                        <SelectItem key={bitrate.value} value={bitrate.value}>
                          {bitrate.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div>
            {onDelete && (
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Xóa
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              Hủy
            </Button>
            <Button onClick={handleSubmit} className="gap-2">
              <Save className="w-4 h-4" />
              LƯU
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
