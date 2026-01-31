import { useState, useMemo, useEffect } from "react";
import { Plus, Lock, Pencil, ChevronRight, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ProfileForm } from "./ProfileForm";
import { getProfiles, updateProfile, Profile } from "@/api/profile";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

// Re-export Profile type for backward compatibility
export type { Profile };

// TODO: Replace with actual API call
const systemPresets = [
  { id: 1, name: "Mobile 360p", isSystem: true },
  { id: 2, name: "SD 480p (Default)", isSystem: true },
  { id: 3, name: "HD 720p", isSystem: true },
  { id: 4, name: "Full HD 1080p", isSystem: true },
];

const mockUserProfiles = [
  { id: 5, name: "2K QHD Gaming", isSystem: false },
  { id: 6, name: "TikTok Vertical", isSystem: false },
  { id: 7, name: "Youtube 4K HDR", isSystem: false },
];

export function ProfileManager() {
  const { t } = useTranslation();
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [userProfiles, setUserProfiles] = useState<Profile[]>([]);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [viewingSystemPreset, setViewingSystemPreset] = useState<Profile | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Convert system presets to Profile format
  const systemProfiles: Profile[] = useMemo(() => {
    return systemPresets.map((preset) => ({
      id: preset.id,
      name: preset.name,
      isSystem: true,
      codec: "libx264",
      width: preset.name.includes("360p") ? 640 : preset.name.includes("480p") ? 854 : preset.name.includes("720p") ? 1280 : 1920,
      height: preset.name.includes("360p") ? 360 : preset.name.includes("480p") ? 480 : preset.name.includes("720p") ? 720 : 1080,
      fps: 30,
      video_bitrate: preset.name.includes("360p") ? 1000 : preset.name.includes("480p") ? 2000 : preset.name.includes("720p") ? 4000 : 8000,
      gop_size: 60,
      audio_codec: "aac",
      audio_bitrate: 128,
    }));
  }, []);

  // Convert user profiles to Profile format
  const userProfilesList: Profile[] = useMemo(() => {
    return userProfiles.map((p) => ({
      ...p,
      isSystem: false,
    }));
  }, [userProfiles]);

  // Filter profiles by search query
  const filteredSystemProfiles = useMemo(() => {
    if (!searchQuery.trim()) {
      return systemProfiles;
    }
    const query = searchQuery.toLowerCase();
    return systemProfiles.filter((profile) =>
      profile.name.toLowerCase().includes(query)
    );
  }, [systemProfiles, searchQuery]);

  const filteredUserProfiles = useMemo(() => {
    if (!searchQuery.trim()) {
      return userProfilesList;
    }
    const query = searchQuery.toLowerCase();
    return userProfilesList.filter((profile) =>
      profile.name.toLowerCase().includes(query)
    );
  }, [userProfilesList, searchQuery]);

  // Fetch profiles on mount
  const fetchProfiles = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await getProfiles();
      if (error) {
        toast.error(`Failed to load profiles: ${error}`);
        // Fallback to mock data on error
        setUserProfiles(mockUserProfiles);
      } else if (data) {
        setUserProfiles(data);
      }
    } catch (err) {
      toast.error(`Failed to load profiles: ${err instanceof Error ? err.message : 'Unknown error'}`);
      // Fallback to mock data on error
      setUserProfiles(mockUserProfiles);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  // Auto-select first preset after profiles are loaded
  useEffect(() => {
    if (!isLoading && systemProfiles.length > 0 && !viewingSystemPreset && !editingProfile && !isCreatingNew) {
      handleViewSystemPreset(systemProfiles[0]);
    }
  }, [isLoading, systemProfiles, viewingSystemPreset, editingProfile, isCreatingNew]);

  const handleCreate = () => {
    // Create a new profile with default values
    const newProfile: Profile = {
      id: 0, // Temporary ID, will be replaced on save
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
      isSystem: false,
    };
    setEditingProfile(newProfile);
    setIsCreatingNew(true);
    setViewingSystemPreset(null);
  };

  const handleEdit = (profile: Profile) => {
    setEditingProfile(profile);
    setIsCreatingNew(false);
    setViewingSystemPreset(null);
  };

  const handleViewSystemPreset = (profile: Profile) => {
    setViewingSystemPreset(profile);
    setEditingProfile(null);
    setIsCreatingNew(false);
  };

  const handleSelectProfile = (profile: Profile) => {
    if (profile.isSystem) {
      handleViewSystemPreset(profile);
    } else {
      handleEdit(profile);
    }
  };

  const handleSave = async (profileData: Profile) => {
    // Refetch profiles list after create/update
    await fetchProfiles();
    
    // Update editing profile with returned data
    if (profileData.id) {
      setEditingProfile(profileData);
      setIsCreatingNew(false);
    }
  };

  const handleDelete = () => {
    if (!editingProfile) return;
    // TODO: Replace with actual API call
    setUserProfiles((prev) => prev.filter((p) => p.id !== editingProfile.id));
    setEditingProfile(null);
    setIsCreatingNew(false);
  };

  const handleCancel = () => {
    setEditingProfile(null);
    setIsCreatingNew(false);
    setViewingSystemPreset(null);
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header Actions */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">{t("profile.manager")}</h1>
        <Button className="gap-2" onClick={handleCreate}>
          <Plus className="w-4 h-4" />
          {t("profile.createNew")}
        </Button>
      </div>

      {/* Split Layout: Left (Lists) + Right (Form) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Left Panel - Profile Lists */}
        <Card className="glass-card flex flex-col min-h-0">
          <CardContent className="p-6 flex flex-col min-h-0">
            {/* Search Box */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t("profile.searchPlaceholder")}
                className="pl-10 bg-secondary/50 border-border/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Combined Profile List */}
            <div className="space-y-4 flex-1 overflow-y-auto scrollbar-thin">
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : filteredSystemProfiles.length === 0 && filteredUserProfiles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  {searchQuery ? t("profile.notFound") : t("profile.noProfiles")}
                </div>
              ) : (
                <>
                  {/* SYSTEM PRESETS Section */}
                  {filteredSystemProfiles.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider sticky top-0 bg-card/80 backdrop-blur-sm py-1 z-10">
                        {t("profile.systemPresets")}
                      </h3>
                      {filteredSystemProfiles.map((profile) => {
                        const isSelected = viewingSystemPreset?.id === profile.id;
                        return (
                          <div
                            key={profile.id}
                            className={`flex items-center gap-2 p-2 rounded-md transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-primary/10 border border-primary/30"
                                : "hover:bg-secondary/30"
                            }`}
                            onClick={() => handleViewSystemPreset(profile)}
                          >
                            <Lock className={`w-4 h-4 shrink-0 ${
                              isSelected ? "text-primary" : "text-muted-foreground"
                            }`} />
                            <span className={`text-sm flex-1 ${
                              isSelected ? "font-medium text-primary" : ""
                            }`}>
                              {profile.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* MY PRESETS Section */}
                  {filteredUserProfiles.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider sticky top-0 bg-card/80 backdrop-blur-sm py-1 z-10">
                        {t("profile.myPresets")}
                      </h3>
                      {filteredUserProfiles.map((profile) => {
                        const isSelected = editingProfile?.id === profile.id;
                        return (
                          <div
                            key={profile.id}
                            className={`flex items-center gap-2 p-2 rounded-md transition-colors group cursor-pointer ${
                              isSelected
                                ? "bg-primary/10 border border-primary/30"
                                : "hover:bg-secondary/30"
                            }`}
                            onClick={() => handleEdit(profile)}
                          >
                            <ChevronRight className={`w-4 h-4 shrink-0 ${
                              isSelected ? "text-primary" : "text-muted-foreground"
                            }`} />
                            <span className={`text-sm flex-1 ${
                              isSelected ? "font-medium text-primary" : ""
                            }`}>
                              {profile.name}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`h-7 w-7 ${
                                isSelected
                                  ? "opacity-100"
                                  : "opacity-0 group-hover:opacity-100"
                              } transition-opacity`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(profile);
                              }}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right Panel - Profile Form */}
        <div className="lg:col-span-2 min-h-0">
          <ProfileForm
            profile={viewingSystemPreset || editingProfile || undefined}
            onSave={handleSave}
            onDelete={editingProfile && !isCreatingNew ? handleDelete : undefined}
            onCancel={isCreatingNew || editingProfile || viewingSystemPreset ? handleCancel : undefined}
            readOnly={!!viewingSystemPreset}
          />
        </div>
      </div>
    </div>
  );
}
