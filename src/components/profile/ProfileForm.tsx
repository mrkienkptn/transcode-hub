import { useState, useEffect } from "react";
import { Trash2, Save, Info, Pencil, Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
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
import { Card, CardContent } from "@/components/ui/card";
import { Profile } from "./ProfileManager";
import { createProfile, updateProfile } from "@/api/profile";
import { toast } from "sonner";

interface ProfileFormProps {
  profile?: Profile | null;
  onSave: (profile: Profile) => void;
  onDelete?: () => void;
  onCancel?: () => void;
  readOnly?: boolean;
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

export function ProfileForm({
  profile,
  onSave,
  onDelete,
  onCancel,
  readOnly = false,
}: ProfileFormProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<ProfileFormData>(defaultProfile);
  const [lockRatio, setLockRatio] = useState(true);
  const [aspectRatio, setAspectRatio] = useState(16 / 9);
  const [isSaving, setIsSaving] = useState(false);

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
  }, [profile]);

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
    if (!formData.video_bitrate || !formData.audio_bitrate) return `0 ${t("profile.fileSizePerHour")}`;
    const totalBitrate = formData.video_bitrate + formData.audio_bitrate;
    const gbPerHour = (totalBitrate * 3600) / (8 * 1024 * 1024 * 1024);
    return `~${gbPerHour.toFixed(1)} ${t("profile.fileSizePerHour")}`;
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      toast.error("Profile name is required");
      return;
    }

    setIsSaving(true);
    try {
      const profileData = formData as Profile;

      // If editing existing profile (has id and id !== 0), update via API
      if (profile && profile.id && profile.id !== 0) {
        const { data, error } = await updateProfile(profile.id, profileData);
        
        if (error) {
          toast.error(`Failed to update profile: ${error}`);
          setIsSaving(false);
          return;
        }

        if (data) {
          toast.success("Profile updated successfully");
          onSave(data);
        }
      } else {
        // If creating new profile, make API call
        const { data, error } = await createProfile(profileData);
        
        if (error) {
          toast.error(`Failed to create profile: ${error}`);
          setIsSaving(false);
          return;
        }

        if (data) {
          toast.success("Profile created successfully");
          onSave(data);
          // Reset form after successful creation
          setFormData(defaultProfile);
          setLockRatio(true);
          setAspectRatio(16 / 9);
        }
      }
    } catch (err) {
      toast.error(`Failed to save profile: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
  };

  if (!profile && formData.name === "") {
    return (
      <Card className="glass-card h-full">
        <CardContent className="p-6 flex items-center justify-center h-full min-h-[600px]">
          <div className="text-center text-muted-foreground">
            <p className="text-sm">{t("profile.selectProfile")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card h-full flex flex-col">
      <CardContent className="p-6 flex flex-col h-full">
        {/* Header */}
        {(profile || !readOnly) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground pb-4 mb-4 border-b border-border/50">
            {readOnly ? (
              <>
                <Lock className="w-4 h-4" />
                <span>{t("profile.viewing")}: {profile?.name}</span>
                <span className="ml-auto text-xs bg-muted px-2 py-1 rounded">{t("common.readOnly")}</span>
              </>
            ) : profile && profile.id && profile.id !== 0 ? (
              <>
                <Pencil className="w-4 h-4" />
                <span>{t("profile.editing")}: {profile.name}</span>
              </>
            ) : (
              <>
                <Info className="w-4 h-4" />
                <span>{t("profile.newProfile") || "New profile"}</span>
              </>
            )}
          </div>
        )}

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 pb-4">
            {/* 1. THÔNG TIN CHUNG */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold">{t("profile.generalInfo")}</h3>
              
              <div className="space-y-2">
                <Label htmlFor="name">{t("profile.profileName")}</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder={t("profile.profileNamePlaceholder")}
                  maxLength={50}
                  disabled={readOnly}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t("profile.description")}</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder={t("profile.descriptionPlaceholder")}
                  rows={3}
                  disabled={readOnly}
                />
              </div>
            </div>

            <Separator />

            {/* 2. VIDEO SETTINGS */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold">{t("profile.videoSettings")}</h3>

              <div className="space-y-2">
                <Label htmlFor="codec">{t("profile.codec")}</Label>
                <Select
                  value={formData.codec || "libx264"}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, codec: value }))
                  }
                  disabled={readOnly}
                >
                  <SelectTrigger id="codec" disabled={readOnly}>
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
                <Label>{t("profile.resolution")}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={formData.width || ""}
                    onChange={(e) => handleWidthChange(e.target.value)}
                    placeholder={t("profile.widthPlaceholder")}
                    className="w-24"
                    disabled={readOnly}
                  />
                  <span className="text-muted-foreground">x</span>
                  <Input
                    type="number"
                    value={formData.height || ""}
                    onChange={(e) => handleHeightChange(e.target.value)}
                    placeholder={t("profile.heightPlaceholder")}
                    className="w-24"
                    disabled={readOnly}
                  />
                  <div className="flex items-center gap-2 ml-2">
                    <Switch
                      checked={lockRatio}
                      onCheckedChange={handleRatioToggle}
                      id="lock-ratio"
                      disabled={readOnly}
                    />
                    <Label htmlFor="lock-ratio" className="text-xs cursor-pointer">
                      {t("profile.ratio")}
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bitrate">{t("profile.bitrate")}</Label>
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
                    placeholder={t("profile.bitratePlaceholder")}
                    className="w-32"
                    disabled={readOnly}
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
                    disabled={readOnly}
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{t("profile.bitrateMin")}</span>
                    <span>{t("profile.bitrateMax")}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fps">{t("profile.fps")}</Label>
                  <Select
                    value={String(formData.fps || 30)}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        fps: parseInt(value),
                      }))
                    }
                    disabled={readOnly}
                  >
                    <SelectTrigger id="fps" disabled={readOnly}>
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
                  <Label htmlFor="gop">{t("profile.gopSize")}</Label>
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
                    placeholder={t("profile.gopPlaceholder")}
                    disabled={readOnly}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* 3. AUDIO SETTINGS */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold">{t("profile.audioSettings")}</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="audio-codec">{t("profile.audioCodec")}</Label>
                  <Select
                    value={formData.audio_codec || "aac"}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, audio_codec: value }))
                    }
                    disabled={readOnly}
                  >
                    <SelectTrigger id="audio-codec" disabled={readOnly}>
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
                  <Label htmlFor="audio-bitrate">{t("profile.audioBitrate")}</Label>
                  <Select
                    value={String(formData.audio_bitrate || 128)}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        audio_bitrate: parseInt(value),
                      }))
                    }
                    disabled={readOnly}
                  >
                    <SelectTrigger id="audio-bitrate" disabled={readOnly}>
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
        {!readOnly && (
          <div className="flex items-center justify-between pt-4 mt-4 border-t">
            <div>
              {onDelete && profile && (
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  className="gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  {t("common.delete")}
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              {onCancel && (
                <Button variant="outline" onClick={onCancel}>
                  {t("common.cancel")}
                </Button>
              )}
              <Button onClick={handleSubmit} className="gap-2" disabled={isSaving}>
                <Save className="w-4 h-4" />
                {isSaving ? t("common.loading") || "Saving..." : t("common.save")}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
