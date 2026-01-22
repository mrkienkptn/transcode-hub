import { Play, Pause, Eye, Settings2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

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

export function ChannelCard({
  channel,
  onStart,
  onStop,
  onPreview,
  onConfigure,
}: ChannelCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isLive = channel.status === "running";

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on buttons
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }
    navigate(`/channel/${channel.id}`);
  };

  return (
    <Card 
      className="glass-card group hover:border-primary/30 transition-colors overflow-hidden cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Thumbnail Section */}
      <div className="relative aspect-video bg-secondary/50 flex items-center justify-center overflow-hidden">
        {channel.thumbnail ? (
          <img
            src={channel.thumbnail}
            alt={channel.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-muted-foreground text-sm">thumb</div>
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
              onClick={(e) => {
                e.stopPropagation();
                onStart?.();
              }}
              className="flex-1 gap-2"
            >
              <Play className="w-4 h-4" />
              {t("channel.start")}
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
