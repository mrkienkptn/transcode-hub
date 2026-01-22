import { useState } from "react";
import { Plus, Lock, Pencil, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CreateProfileModal } from "./CreateProfileModal";

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

export interface Profile {
  id: number;
  name: string;
  is_active?: boolean;
  codec?: string;
  width?: number;
  height?: number;
  fps?: number;
  video_bitrate?: number;
  gop_size?: number;
  preset?: string;
  profile?: string;
  audio_codec?: string;
  audio_bitrate?: number;
  sample_rate?: number;
  created_at?: string;
}

export function ProfileManager() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [userProfiles, setUserProfiles] = useState(mockUserProfiles);

  const handleCreate = () => {
    setEditingProfile(null);
    setIsCreateOpen(true);
  };

  const handleEdit = (profile: Profile) => {
    setEditingProfile(profile);
    setIsCreateOpen(true);
  };

  const handleSave = (profileData: Profile) => {
    // TODO: Replace with actual API call
    if (editingProfile) {
      // Update existing profile
      setUserProfiles((prev) =>
        prev.map((p) => (p.id === editingProfile.id ? { ...p, ...profileData } : p))
      );
    } else {
      // Create new profile
      const newProfile = {
        id: Date.now(),
        ...profileData,
        isSystem: false,
      };
      setUserProfiles((prev) => [...prev, newProfile]);
    }
    setIsCreateOpen(false);
    setEditingProfile(null);
  };

  const handleDelete = (profileId: number) => {
    // TODO: Replace with actual API call
    setUserProfiles((prev) => prev.filter((p) => p.id !== profileId));
    setIsCreateOpen(false);
    setEditingProfile(null);
  };

  const handleClose = () => {
    setIsCreateOpen(false);
    setEditingProfile(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between gap-4">
        <Button className="gap-2" onClick={handleCreate}>
          <Plus className="w-4 h-4" />
          TẠO PROFILE MỚI
        </Button>
        {editingProfile && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Pencil className="w-4 h-4" />
            <span>ĐANG SỬA: {editingProfile.name}</span>
          </div>
        )}
      </div>

      <CreateProfileModal
        open={isCreateOpen}
        onOpenChange={handleClose}
        profile={editingProfile}
        onSave={handleSave}
        onDelete={editingProfile ? () => handleDelete(editingProfile.id) : undefined}
      />

      {/* Profiles List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Presets */}
        <Card className="glass-card">
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold mb-4 text-muted-foreground">
              SYSTEM PRESETS (Mẫu)
            </h3>
            <div className="space-y-2">
              {systemPresets.map((preset) => (
                <div
                  key={preset.id}
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-secondary/30 transition-colors"
                >
                  <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-sm flex-1">{preset.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* User Presets */}
        <Card className="glass-card">
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold mb-4 text-muted-foreground">
              MY PRESETS (Của tôi)
            </h3>
            <div className="space-y-2">
              {userProfiles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Chưa có profile nào. Nhấn "TẠO PROFILE MỚI" để tạo.
                </div>
              ) : (
                userProfiles.map((profile) => (
                  <div
                    key={profile.id}
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-secondary/30 transition-colors group cursor-pointer"
                    onClick={() => handleEdit(profile as Profile)}
                  >
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-sm flex-1">{profile.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(profile as Profile);
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
