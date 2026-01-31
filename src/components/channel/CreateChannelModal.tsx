import { useState, useEffect } from "react";
import { Eye, EyeOff, Copy, ChevronDown, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { createChannel } from "@/api/channel";
import { getProfiles, Profile } from "@/api/profile";

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

// Helper function to format profile display
const formatProfileDisplay = (profile: Profile) => {
  const resolution = profile.width && profile.height ? `${profile.width}x${profile.height}` : "N/A";
  const bitrate = profile.video_bitrate ? `${profile.video_bitrate}` : "N/A";
  const codec = profile.codec || "N/A";
  return { resolution, bitrate, codec };
};

const targetFormats = ["HLS", "DASH", "RTMP", "RTSP"];

const defaultTargetLinks: Record<string, string> = {
  HLS: "http://cdn.example.com/hls/stream.m3u8",
  DASH: "http://cdn.example.com/dash/stream.mpd",
  RTMP: "rtmp://output.stream/live",
  RTSP: "rtsp://output.stream:554/live",
};

interface ChannelFormData {
  name: string;
  mainInputId: string;
  mainInputUri: string;
  mainInputKey: string;
  backupInputId: string;
  backupInputUri: string;
  backupInputKey: string;
  profileIds: number[]; // Changed to number array for API
  targetLinks: Record<string, string>; // Format -> URI mapping
  selectedTargets: string[]; // Selected target formats
}

const getDefaultFormData = (profiles: Profile[]): ChannelFormData => ({
  name: "New Channel",
  mainInputId: mockInputs[0]?.id || "",
  mainInputUri: mockInputs[0]?.uri || "",
  mainInputKey: "",
  backupInputId: mockInputs[0]?.id || "",
  backupInputUri: mockInputs[0]?.uri || "",
  backupInputKey: "",
  profileIds: profiles.map((p) => p.id) as number[], // Default: select all profiles
  targetLinks: { ...defaultTargetLinks }, // Pre-generate all target links
  selectedTargets: targetFormats, // Default: select all targets
});

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
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);
  const [formData, setFormData] = useState<ChannelFormData>(getDefaultFormData([]));
  const [showMainKey, setShowMainKey] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Fetch profiles when modal opens
  useEffect(() => {
    if (open) {
      fetchProfiles();
    }
  }, [open]);

  // Update form data when profiles are loaded
  useEffect(() => {
    if (profiles.length > 0) {
      setFormData((prev) => ({
        ...prev,
        profileIds: profiles.map((p) => p.id), // Default: select all profiles
      }));
    }
  }, [profiles]);

  const fetchProfiles = async () => {
    setIsLoadingProfiles(true);
    try {
      const { data, error } = await getProfiles();
      if (error) {
        toast.error(`Failed to load profiles: ${error}`);
      } else if (data) {
        setProfiles(data);
      }
    } catch (err) {
      toast.error(`Failed to load profiles: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoadingProfiles(false);
    }
  };

  const selectedProfiles = profiles.filter((p) => formData.profileIds.includes(p.id));
  const isRtmpPush = mockInputs.find((i) => i.id === formData.mainInputId)?.name === "RTMP Push";

  const handleClose = () => {
    setFormData(getDefaultFormData(profiles));
    setShowMainKey(false);
    setIsSubmitting(false);
    setIsAdvancedOpen(false);
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

  const handleProfileToggle = (profileId: number) => {
    setFormData((prev) => {
      const isSelected = prev.profileIds.includes(profileId);
      return {
        ...prev,
        profileIds: isSelected
          ? prev.profileIds.filter((id) => id !== profileId)
          : [...prev.profileIds, profileId],
      };
    });
  };

  const handleTargetToggle = (format: string) => {
    setFormData((prev) => {
      const isSelected = prev.selectedTargets.includes(format);
      return {
        ...prev,
        selectedTargets: isSelected
          ? prev.selectedTargets.filter((f) => f !== format)
          : [...prev.selectedTargets, format],
      };
    });
  };

  const handleTargetLinkChange = (format: string, uri: string) => {
    setFormData((prev) => ({
      ...prev,
      targetLinks: {
        ...prev.targetLinks,
        [format]: uri,
      },
    }));
  };

  const handleCopyTargetLink = async (format: string) => {
    try {
      await navigator.clipboard.writeText(formData.targetLinks[format] || "");
      toast.success(`${format} link copied to clipboard`);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.name.trim()) {
      toast.error("Channel name is required");
      return;
    }

    if (!formData.mainInputUri.trim()) {
      toast.error("Input URI is required");
      return;
    }

    if (formData.profileIds.length === 0) {
      toast.error("At least one profile must be selected");
      return;
    }

    if (formData.selectedTargets.length === 0) {
      toast.error("At least one target must be selected");
      return;
    }

    setIsSubmitting(true);

    try {
      // Build target URLs array from selected targets and their links
      const targetUrls = formData.selectedTargets
        .map((format) => formData.targetLinks[format])
        .filter((url) => url && url.trim() !== ""); // Filter out empty URLs

      // Build the request payload
      const channelData = {
        name: formData.name.trim(),
        input: formData.mainInputUri.trim(),
        profiles: formData.profileIds.length > 0 ? formData.profileIds : undefined,
        target: targetUrls.length > 0 ? targetUrls : undefined,
        token: isRtmpPush && formData.mainInputKey ? formData.mainInputKey : undefined,
      };

      const { data, error } = await createChannel(channelData);

      if (error) {
        toast.error(`Failed to create channel: ${error}`);
        setIsSubmitting(false);
        return;
      }

      if (data) {
        toast.success("Channel created successfully");
        handleClose();
        // Optionally refresh the channel list by calling a callback or refetch
        // This would require adding an onSuccess prop to the component
      }
    } catch (err) {
      toast.error(`Failed to create channel: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsSubmitting(false);
    }
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

            {/* Targets Section */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">{t("channel.targets")}</Label>
              <div className="space-y-3">
                {targetFormats.map((format) => {
                  const isSelected = formData.selectedTargets.includes(format);
                  return (
                    <div
                      key={format}
                      className={`p-3 rounded-lg transition-colors border ${
                        isSelected
                          ? "bg-primary/10 border-primary/30"
                          : "bg-secondary/50 border-transparent hover:bg-secondary"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleTargetToggle(format)}
                          className="shrink-0"
                        />
                        <Label className="font-medium text-sm text-foreground cursor-pointer flex-1">
                          {format}
                        </Label>
                      </div>
                      <div className="flex items-center gap-2 ml-7">
                        <Input
                          className="flex-1 font-mono text-xs"
                          value={formData.targetLinks[format] || ""}
                          onChange={(e) => handleTargetLinkChange(format, e.target.value)}
                          placeholder={`Enter ${format} output URI`}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleCopyTargetLink(format)}
                          className="h-9 w-9 shrink-0"
                          type="button"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Advanced Settings - Profile Config */}
            <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
              <div className="space-y-2">
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-0 h-auto hover:bg-transparent"
                    type="button"
                  >
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-muted-foreground" />
                      <Label className="text-base font-semibold cursor-pointer">
                        Advanced Settings
                      </Label>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                        isAdvancedOpen ? "rotate-180" : ""
                      }`}
                    />
                  </Button>
                </CollapsibleTrigger>

                <CollapsibleContent className="space-y-4 pt-2">
                  {/* Profile Selection */}
                  <div className="space-y-2">
                    <Label>{t("channel.profileSection")}</Label>
                    {isLoadingProfiles ? (
                      <div className="text-sm text-muted-foreground">Loading profiles...</div>
                    ) : profiles.length === 0 ? (
                      <div className="text-sm text-muted-foreground">No profiles available</div>
                    ) : (
                      <div className="space-y-2">
                        {profiles.map((profile) => {
                          const isSelected = formData.profileIds.includes(profile.id);
                          const { resolution, bitrate, codec } = formatProfileDisplay(profile);
                          return (
                            <div
                              key={profile.id}
                              className={`p-3 rounded-lg transition-colors border ${
                                isSelected
                                  ? "bg-primary/10 border-primary/30"
                                  : "bg-secondary/50 border-transparent hover:bg-secondary"
                              }`}
                            >
                              {/* TOP ROW: Checkbox and Title */}
                              <div className="flex items-center gap-3 mb-2">
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() => handleProfileToggle(profile.id)}
                                  className="shrink-0"
                                />
                                <div className="font-medium text-sm text-foreground">
                                  {profile.name}
                                </div>
                              </div>

                              {/* BOTTOM ROW: Chips with separators */}
                              <div className="flex items-center gap-0 ml-7">
                                <div className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-secondary text-[12px] font-medium text-secondary-foreground border border-secondary-foreground/10 w-24">
                                  {resolution}
                                </div>
                                <div className="h-6 w-px bg-border mx-1" />
                                <div className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-secondary text-[12px] font-medium text-secondary-foreground border border-secondary-foreground/10 w-24">
                                  {bitrate} {bitrate !== "N/A" && "kbps"}
                                </div>
                                <div className="h-6 w-px bg-border mx-1" />
                                <div className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-secondary text-[12px] font-medium text-secondary-foreground border border-secondary-foreground/10 w-24">
                                  {codec}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          </div>
        </ScrollArea>

        <DialogFooter className="pt-4 border-t">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || isLoadingProfiles}>
            {isSubmitting ? "Creating..." : t("channel.createChannel")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
