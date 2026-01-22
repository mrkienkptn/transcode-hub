import { useState, useEffect } from "react";
import { Plus, Trash2, Check, Eye, EyeOff, Copy } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
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
import { profile } from "console";

interface CreateChannelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Mock data - replace with actual data
const mockInputs = [
  { id: "1", name: "RTMP", uri: "rtmp://input.stream/live" },
  { id: "2", name: "RTMP Push", uri: "rtmp://input.stream/live" },
  { id: "3", name: "SRT", uri: "srt://192.168.1.50:9000" },
  { id: "4", name: "UDP Multicast", uri: "udp://239.0.0.1:5000" },
  { id: "5", name: "File Input", uri: "file:///media/content.mp4" },
];

const mockProfiles = [
  {
    id: "1",
    name: "Broadcast Standard",
    presets: [
      {
        id: "p1",
        name: "1080p60 H.264",
        codec: "H.264",
        resolution: "1920x1080",
      },
      {
        id: "p2",
        name: "720p30 H.264",
        codec: "H.264",
        resolution: "1280x720",
      },
    ],
  },
  {
    id: "2",
    name: "OTT Adaptive",
    presets: [
      { id: "p3", name: "4K HEVC", codec: "HEVC", resolution: "3840x2160" },
      { id: "p4", name: "1080p HEVC", codec: "HEVC", resolution: "1920x1080" },
      { id: "p5", name: "720p HEVC", codec: "HEVC", resolution: "1280x720" },
      { id: "p6", name: "480p HEVC", codec: "HEVC", resolution: "854x480" },
    ],
  },
  {
    id: "3",
    name: "Social Media Package",
    presets: [
      {
        id: "p7",
        name: "Square 1080p",
        codec: "H.264",
        resolution: "1080x1080",
      },
      {
        id: "p8",
        name: "Vertical 1080p",
        codec: "H.264",
        resolution: "1080x1920",
      },
    ],
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
  mainInputKey: string;
  backupInputId: string;
  backupInputUri: string;
  backupInputKey: string;
  profileId: string;
  targets: Target[];
}

const defaultFormData: ChannelFormData = {
  name: "New Channel",
  mainInputId: mockInputs[0]?.id,
  mainInputUri: mockInputs[0]?.uri,
  mainInputKey: "",
  backupInputId: mockInputs[0]?.id,
  backupInputUri: mockInputs[0]?.uri,
  backupInputKey: "",
  profileId: mockProfiles[0]?.id,
  targets: [],
};

// Generate a random stream key
const generateStreamKey = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let key = "";
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
};

// Generate channel ID from channel name
const generateChannelId = (channelName: string): string => {
  // Convert channel name to lowercase, replace spaces with hyphens, remove special chars
  const slug = channelName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .substring(0, 20);
  // Add random suffix for uniqueness
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${slug}-${randomSuffix}`;
};

// Generate RTMP Push URI
const generateRtmpPushUri = (channelName: string, ip: string = "192.168.1.10"): string => {
  const channelId = generateChannelId(channelName);
  return `rtmp://${ip}:1935/${channelId}`;
};

export function CreateChannelModal({
  open,
  onOpenChange,
}: CreateChannelModalProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<ChannelFormData>(defaultFormData);
  const [showMainKey, setShowMainKey] = useState(false);

  const selectedProfile = mockProfiles.find((p) => p.id === formData.profileId);
  const isRtmpPush = mockInputs.find((i) => i.id === formData.mainInputId)?.name === "RTMP Push";

  const handleClose = () => {
    setFormData(defaultFormData);
    setShowMainKey(false);
    onOpenChange(false);
  };

  const handleMainInputSelect = (inputId: string) => {
    const input = mockInputs.find((i) => i.id === inputId);
    const isRtmpPushSelected = input?.name === "RTMP Push";
    setFormData((prev) => ({
      ...prev,
      mainInputId: inputId,
      mainInputUri: isRtmpPushSelected 
        ? generateRtmpPushUri(prev.name) 
        : (input?.uri || ""),
      mainInputKey: isRtmpPushSelected ? generateStreamKey() : "", // Auto-generate key for RTMP Push
    }));
    setShowMainKey(false); // Reset visibility when input changes
  };

  // Update URI when channel name changes and RTMP Push is selected
  useEffect(() => {
    if (isRtmpPush && formData.name) {
      setFormData((prev) => ({
        ...prev,
        mainInputUri: generateRtmpPushUri(prev.name),
      }));
    }
  }, [formData.name, isRtmpPush]);

  const handleCopyUri = async () => {
    try {
      await navigator.clipboard.writeText(formData.mainInputUri);
      toast.success("URI copied to clipboard");
    } catch (err) {
      toast.error("Failed to copy URI");
    }
  };

  const handleCopyKey = async () => {
    try {
      await navigator.clipboard.writeText(formData.mainInputKey);
      toast.success("Stream key copied to clipboard");
    } catch (err) {
      toast.error("Failed to copy stream key");
    }
  };

  const handleBackupInputSelect = (inputId: string) => {
    const input = mockInputs.find((i) => i.id === inputId);
    setFormData((prev) => ({
      ...prev,
      backupInputId: inputId,
      backupInputUri: input?.uri,
      backupInputKey: "", // Reset key when input changes
    }));
  };

  const handleProfileSelect = (profileId: string) => {
    // Reset targets when profile changes (presets may be different)
    setFormData((prev) => ({
      ...prev,
      profileId,
      targets: prev.targets.map((t) => ({ ...t, selectedPresets: [] })),
    }));
  };

  const addTarget = () => {
    const newTarget: Target = {
      id: Date.now().toString(),
      format: "RTMP",
      outputUri: defaultUriByFormat["RTMP"],
      selectedPresets: [],
    };
    setFormData((prev) => ({
      ...prev,
      targets: [...prev.targets, newTarget],
    }));
  };

  const removeTarget = (targetId: string) => {
    setFormData((prev) => ({
      ...prev,
      targets: prev.targets.filter((t) => t.id !== targetId),
    }));
  };

  const updateTarget = (targetId: string, updates: Partial<Target>) => {
    setFormData((prev) => ({
      ...prev,
      targets: prev.targets.map((t) =>
        t.id === targetId ? { ...t, ...updates } : t
      ),
    }));
  };

  const handleTargetFormatChange = (targetId: string, format: string) => {
    updateTarget(targetId, {
      format,
      outputUri: defaultUriByFormat[format],
    });
  };

  const togglePresetForTarget = (targetId: string, presetId: string) => {
    setFormData((prev) => ({
      ...prev,
      targets: prev.targets.map((t) => {
        if (t.id !== targetId) return t;
        const isSelected = t.selectedPresets.includes(presetId);
        return {
          ...t,
          selectedPresets: isSelected
            ? t.selectedPresets.filter((p) => p !== presetId)
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
          <DialogTitle>{t("channel.createNew")}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[800px] pr-4">
          <div className="space-y-6 pb-4">
            {/* Channel Name */}
            <div className="space-y-2">
              <Label htmlFor="name">{t("channel.channelName")}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder={t("channel.channelNamePlaceholder")}
              />
            </div>

            <Separator />

            {/* Input Section */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">{t("channel.inputSection")}</Label>

              {/* Main Input */}
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  {t("channel.mainUri")}
                </Label>
                <div className="flex gap-2">
                  <Select
                    value={formData.mainInputId}
                    onValueChange={handleMainInputSelect}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder={t("channel.selectInput")} />
                    </SelectTrigger>
                    <SelectContent>
                      {mockInputs.map((input) => (
                        <SelectItem key={input.id} value={input.id}>
                          {input.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    className="flex-1 font-mono text-xs"
                    value={formData.mainInputUri}
                    onChange={(e) =>
                      !isRtmpPush &&
                      setFormData((prev) => ({
                        ...prev,
                        mainInputUri: e.target.value,
                      }))
                    }
                    placeholder={t("channel.inputUri")}
                    readOnly={isRtmpPush}
                  />
                  {isRtmpPush && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopyUri}
                      className="h-10 w-10"
                      type="button"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                {/* Key field for RTMP Push */}
                {isRtmpPush && (
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">
                      Stream Key
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        value={formData.mainInputKey}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            mainInputKey: e.target.value,
                          }))
                        }
                        placeholder="Stream key will be auto-generated"
                        type={showMainKey ? "text" : "password"}
                        readOnly
                        className="flex-1 font-mono text-xs"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setShowMainKey(!showMainKey)}
                        className="h-10 w-10"
                        type="button"
                      >
                        {showMainKey ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleCopyKey}
                        className="h-10 w-10"
                        type="button"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Profile Selection */}
            <div className="space-y-2">
              <Label>{t("channel.profileSection")}</Label>
              <ScrollArea>
                <div className="p-3 space-y-2">
                  {mockProfiles.map((profile) => {
                    const isSelected = formData.profileId.includes(profile.id);
                    return (
                      <div
                        key={profile.id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors border
  ${
    isSelected
      ? "bg-primary/10 border-primary/30"
      : "bg-secondary/50 border-transparent hover:bg-secondary"
  }`}
                        onClick={() => handleProfileSelect(profile.id)}
                      >
                        {/* TOP ROW: Checkbox and Title */}
                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className={`h-4 w-4 shrink-0 rounded border flex items-center justify-center transition-all
      ${
        isSelected ? "bg-primary border-primary" : "border-muted-foreground/50"
      }`}
                          >
                            {isSelected && (
                              <Check className="w-3 h-3 text-primary-foreground" />
                            )}
                          </div>

                          <div className="font-medium text-sm text-foreground">
                            {profile.name}
                          </div>
                        </div>

                        {/* BOTTOM ROW: Presets as Chips (Indented to align with Title) */}
                        <div className="flex flex-row flex-wrap gap-1.5 ml-7">
                          {profile.presets.map((preset, index) => (
                            <div
                              key={index}
                              className="inline-flex items-center px-2 py-0.5 rounded-md bg-secondary text-[10px] font-medium text-secondary-foreground border border-secondary-foreground/10"
                            >
                              {preset.name} • {preset.codec} •{" "}
                              {preset.resolution}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>

            <Separator />

            {/* Targets Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">{t("channel.targets")}</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addTarget}
                  className="gap-1"
                >
                  <Plus className="w-3 h-3" />
                  {t("channel.addTarget")}
                </Button>
              </div>

              {formData.targets.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm border border-dashed rounded-lg">
                  {t("channel.noTargets")}
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.targets.map((target, index) => (
                    <div
                      key={target.id}
                      className="p-4 rounded-lg border bg-secondary/30 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {t("channel.target")} {index + 1}
                        </span>
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
                          onValueChange={(v) =>
                            handleTargetFormatChange(target.id, v)
                          }
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {formatTypes.map((format) => (
                              <SelectItem key={format} value={format}>
                                {format}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          className="flex-1"
                          value={target.outputUri}
                          onChange={(e) =>
                            updateTarget(target.id, {
                              outputUri: e.target.value,
                            })
                          }
                          placeholder={t("channel.outputUri")}
                        />
                      </div>

                      {/* Preset Selection */}
                      {selectedProfile &&
                        selectedProfile.presets.length > 0 && (
                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">
                              {t("channel.presets")}
                            </Label>
                            <div className="flex flex-wrap gap-2">
                              {selectedProfile.presets.map((preset) => {
                                const isSelected =
                                  target.selectedPresets.includes(preset.id);
                                return (
                                  <div
                                    key={preset.id}
                                    onClick={() =>
                                      togglePresetForTarget(
                                        target.id,
                                        preset.id
                                      )
                                    }
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer transition-colors text-xs
                                    ${
                                      isSelected
                                        ? "bg-primary/20 border border-primary/50 text-primary"
                                        : "bg-secondary border border-transparent hover:bg-secondary/80"
                                    }`}
                                  >
                                    {isSelected && (
                                      <Check className="w-3 h-3" />
                                    )}
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
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSubmit}>{t("channel.createChannel")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
