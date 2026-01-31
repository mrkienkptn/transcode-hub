import { useState } from "react";
import { Play, Pause, Eye, Settings2, Video } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { startChannel } from "@/api/channel";
import { toast } from "sonner";

interface ChannelCardProps {
  channel: {
    id: number;
    name: string;
    status: "running" | "idle" | "error";
    uptime: string;
    thumbnail?: string;
  };
  onStart?: () => void;
  onStop?: () => void;
  onPreview?: () => void;
  onConfigure?: () => void;
}

// Default thumbnail image for live channels without thumbnail (SVG data URI)
const DEFAULT_LIVE_THUMBNAIL = `data:image/svg+xml,${encodeURIComponent(`
  <svg width="640" height="360" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#1a1a1a;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#0f0f0f;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="640" height="360" fill="url(#grad)"/>
    <circle cx="320" cy="150" r="40" fill="none" stroke="#4ade80" stroke-width="3" opacity="0.6"/>
    <circle cx="320" cy="150" r="25" fill="#4ade80" opacity="0.8"/>
    <polygon points="310,145 310,155 320,150" fill="#1a1a1a"/>
    <text x="320" y="220" font-family="Arial, sans-serif" font-size="24" fill="#4ade80" text-anchor="middle" font-weight="bold">LIVE</text>
    <text x="320" y="250" font-family="Arial, sans-serif" font-size="14" fill="#888" text-anchor="middle">Streaming</text>
  </svg>
`)}`;

export function ChannelCard({
  channel,
  onStart,
  onStop,
  onPreview,
  onConfigure,
}: ChannelCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isStarting, setIsStarting] = useState(false);
  const isLive = channel.status === "running";

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on buttons
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }
    navigate(`/channel/${channel.id}`);
  };

  // Determine thumbnail source
  const getThumbnailSrc = () => {
    if (channel.thumbnail) {
      return channel.thumbnail;
    }
    // If live and no thumbnail, use default image
    if (isLive) {
      return DEFAULT_LIVE_THUMBNAIL;
    }
    // For idle/error, return null to show placeholder
    return null;
  };

  const thumbnailSrc = getThumbnailSrc();

  const handleStart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isStarting) return;
    
    setIsStarting(true);
    try {
      const { error } = await startChannel(channel.id);
      
      if (error) {
        toast.error(`Failed to start channel: ${error}`);
      } else {
        toast.success("Channel started successfully");
        // Call the onStart callback if provided (e.g., to refresh the channel list)
        onStart?.();
      }
    } catch (err) {
      toast.error(`Failed to start channel: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <Card 
      className="glass-card group hover:border-primary/30 transition-colors overflow-hidden cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Thumbnail Section */}
      <div className="relative aspect-video bg-gradient-to-br from-secondary/80 via-secondary/60 to-secondary/40 flex items-center justify-center overflow-hidden">
        {thumbnailSrc ? (
          <img
            src={thumbnailSrc}
            alt={channel.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <Video className="w-12 h-12 opacity-50" />
          </div>
        )}
        
        {/* Status Badge - Top Right */}
        {isLive && (
          <Badge
            variant="default"
            className="absolute top-2 right-2 bg-green-500 text-destructive-foreground animate-pulse"
          >
            Live
          </Badge>
        )}
        {channel.status === "idle" && (
          <Badge
            variant="secondary"
            className="absolute top-2 right-2"
          >
            {t("channel.idle")}
          </Badge>
        )}
        {channel.status === "error" && (
          <Badge
            variant="destructive"
            className="absolute top-2 right-2"
          >
            {t("channel.error")}
          </Badge>
        )}
      </div>

      {/* Info Section */}
      <CardContent className="p-4 space-y-3">
        {/* Title */}
        <div>
          <h3 className="font-semibold text-foreground line-clamp-1">
            {channel.name}
          </h3>
          {channel.uptime && channel.uptime !== "-" && (
            <p className="text-xs text-muted-foreground mt-1">
              {t("channel.uptime")}: {channel.uptime}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Start/Stop Button */}
          {isLive ? (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onStop?.();
              }}
              className="flex-1 gap-2"
            >
              <Pause className="w-4 h-4" />
              {t("channel.stop")}
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={handleStart}
              disabled={isStarting}
              className="flex-1 gap-2"
            >
              <Play className="w-4 h-4" />
              {isStarting ? t("common.loading") : t("channel.start")}
            </Button>
          )}

          {/* Preview Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onPreview?.();
            }}
            className="h-9 w-9"
            title={t("channel.preview")}
          >
            <Eye className="w-4 h-4" />
          </Button>

          {/* Configure Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onConfigure?.();
            }}
            className="h-9 w-9"
            title={t("channel.configure")}
          >
            <Settings2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
