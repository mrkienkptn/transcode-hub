import { useState, useEffect, useRef, useCallback } from "react";
import { Plus, Search, Play, Pause, Square, Settings2, Trash2, Radio, ChevronLeft, ChevronRight, LayoutGrid, List } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateChannelModal } from "./CreateChannelModal";
import { ChannelCard } from "./ChannelCard";

// TODO: Replace with actual API call
const mockChannels = [
  { id: 1, name: "Channel 1 - Sports", input: "rtmp://input.stream/sports", profile: "Broadcast Standard", status: "running", bitrate: "8.2 Mbps", uptime: "4h 32m" },
  { id: 2, name: "Channel 2 - News", input: "srt://192.168.1.50:9000", profile: "OTT Adaptive", status: "running", bitrate: "24.5 Mbps", uptime: "12h 15m" },
  { id: 3, name: "Channel 3 - Entertainment", input: "rtmp://input.stream/ent", profile: "Social Media Package", status: "idle", bitrate: "0 Mbps", uptime: "-" },
  { id: 4, name: "Channel 4 - Music", input: "udp://239.0.0.1:5000", profile: "Broadcast Standard", status: "running", bitrate: "7.8 Mbps", uptime: "2h 45m" },
  { id: 5, name: "Channel 5 - Archive", input: "file:///media/archive/show.mp4", profile: "Archive Quality", status: "error", bitrate: "0 Mbps", uptime: "-" },
  { id: 6, name: "Channel 6 - Documentary", input: "rtmp://input.stream/doc", profile: "Broadcast Standard", status: "running", bitrate: "6.5 Mbps", uptime: "1h 20m" },
  { id: 7, name: "Channel 7 - Kids", input: "srt://192.168.1.51:9000", profile: "OTT Adaptive", status: "idle", bitrate: "0 Mbps", uptime: "-" },
  { id: 8, name: "Channel 8 - Movies", input: "udp://239.0.0.2:5000", profile: "Archive Quality", status: "running", bitrate: "15.2 Mbps", uptime: "5h 10m" },
];

const DEFAULT_PAGE = 1;
const DEFAULT_RECORDS_PER_PAGE = 5;
const RECORDS_PER_PAGE_OPTIONS = [5, 10, 20, 50];

const getStatusConfig = (t: (key: string) => string) => ({
  running: { color: "bg-success", label: t("channel.running"), icon: Play },
  idle: { color: "bg-warning", label: t("channel.idle"), icon: Pause },
  error: { color: "bg-destructive", label: t("channel.error"), icon: Square },
});

type LayoutType = "table" | "grid";

export function ChannelManager() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [layout, setLayout] = useState<LayoutType>(() => {
    const saved = localStorage.getItem("channelLayout");
    return (saved === "grid" || saved === "table") ? saved : "table";
  });
  const [displayedChannels, setDisplayedChannels] = useState<typeof mockChannels>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);
  const statusConfig = getStatusConfig(t);

  // Get params from URL
  const nameFilter = searchParams.get("name") || "";
  const currentPage = parseInt(searchParams.get("p") || String(DEFAULT_PAGE), 10);
  const recordsPerPage = parseInt(searchParams.get("r") || String(DEFAULT_RECORDS_PER_PAGE), 10);

  // Save layout preference
  useEffect(() => {
    localStorage.setItem("channelLayout", layout);
  }, [layout]);

  // Update search params while preserving existing ones
  const updateSearchParams = (updates: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    setSearchParams(newParams);
  };

  const handleSearchChange = (value: string) => {
    updateSearchParams({ name: value || null, p: "1" }); // Reset to page 1 on search
  };

  const handlePageChange = (page: number) => {
    updateSearchParams({ p: String(page) });
  };

  const handleRecordsPerPageChange = (value: string) => {
    updateSearchParams({ r: value, p: "1" }); // Reset to page 1 when changing records per page
  };

  // Filter channels based on URL search param
  const filteredChannels = mockChannels.filter((channel) =>
    channel.name.toLowerCase().includes(nameFilter.toLowerCase())
  );

  // Initialize displayed channels for grid layout
  useEffect(() => {
    if (layout === "grid") {
      const initialCount = 12; // Load 12 items initially
      setDisplayedChannels(filteredChannels.slice(0, initialCount) as typeof mockChannels);
    } else {
      // Reset when switching to table layout
      setDisplayedChannels([]);
    }
  }, [layout, filteredChannels]);

  // Infinite scroll for grid layout
  const loadMoreChannels = useCallback(() => {
    if (isLoadingMore || layout !== "grid") return;
    
    setIsLoadingMore(true);
    // Simulate API delay
    setTimeout(() => {
      const currentCount = displayedChannels.length;
      const nextChannels = filteredChannels.slice(currentCount, currentCount + 12);
      setDisplayedChannels((prev) => [...prev, ...nextChannels]);
      setIsLoadingMore(false);
    }, 300);
  }, [isLoadingMore, layout, displayedChannels.length, filteredChannels]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (layout !== "grid") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayedChannels.length < filteredChannels.length) {
          loadMoreChannels();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [layout, displayedChannels.length, filteredChannels.length, loadMoreChannels]);

  // Pagination calculations for table layout
  const totalRecords = filteredChannels.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const validCurrentPage = Math.min(Math.max(1, currentPage), Math.max(1, totalPages));
  const startIndex = (validCurrentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const paginatedChannels = filteredChannels.slice(startIndex, endIndex);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (validCurrentPage > 3) pages.push("ellipsis");
      for (let i = Math.max(2, validCurrentPage - 1); i <= Math.min(totalPages - 1, validCurrentPage + 1); i++) {
        pages.push(i);
      }
      if (validCurrentPage < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  };

  const handleStart = (channelId: number) => {
    console.log("Start channel:", channelId);
    // TODO: Implement start channel API call
  };

  const handleStop = (channelId: number) => {
    console.log("Stop channel:", channelId);
    // TODO: Implement stop channel API call
  };

  const handlePreview = (channelId: number) => {
    console.log("Preview channel:", channelId);
    // TODO: Implement preview channel
  };

  const handleConfigure = (channelId: number) => {
    console.log("Configure channel:", channelId);
    // TODO: Implement configure channel
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder={t("channel.searchPlaceholder")} 
            className="pl-10 bg-secondary/50 border-border/50"
            value={nameFilter}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          {/* Layout Switcher */}
          <ToggleGroup type="single" value={layout} onValueChange={(value) => value && setLayout(value as LayoutType)}>
            <ToggleGroupItem value="table" aria-label={t("channel.layoutTable")}>
              <List className="w-4 h-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="grid" aria-label={t("channel.layoutGrid")}>
              <LayoutGrid className="w-4 h-4" />
            </ToggleGroupItem>
          </ToggleGroup>
          <Button className="gap-2" onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-4 h-4" />
            {t("channel.newChannel")}
          </Button>
        </div>
      </div>

      <CreateChannelModal open={isCreateOpen} onOpenChange={setIsCreateOpen} />

      {/* Grid Layout */}
      {layout === "grid" ? (
        <>
          {displayedChannels.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="p-8 text-center text-muted-foreground">
                {t("channel.noChannels")}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayedChannels.map((channel) => (
                <ChannelCard
                  key={channel.id}
                  channel={{
                    id: channel.id,
                    name: channel.name,
                    status: channel.status as "running" | "idle" | "error",
                    uptime: channel.uptime,
                    thumbnail: undefined, // TODO: Add thumbnail URL when available
                  }}
                  onStart={() => handleStart(channel.id)}
                  onStop={() => handleStop(channel.id)}
                  onPreview={() => handlePreview(channel.id)}
                  onConfigure={() => handleConfigure(channel.id)}
                />
              ))}
            </div>
          )}
          
          {/* Infinite Scroll Trigger */}
          {displayedChannels.length < filteredChannels.length && (
            <div ref={observerTarget} className="h-10 flex items-center justify-center">
              {isLoadingMore && (
                <div className="text-sm text-muted-foreground">{t("common.loading")}</div>
              )}
            </div>
          )}
        </>
      ) : (
        <>
          {/* Table Layout */}
          <Card className="glass-card">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead className="text-muted-foreground">{t("channel.status")}</TableHead>
                    <TableHead className="text-muted-foreground">{t("channel.channel")}</TableHead>
                    <TableHead className="text-muted-foreground hidden md:table-cell">{t("channel.input")}</TableHead>
                    <TableHead className="text-muted-foreground hidden lg:table-cell">{t("channel.profile")}</TableHead>
                    <TableHead className="text-muted-foreground text-right">{t("channel.bitrate")}</TableHead>
                    <TableHead className="text-muted-foreground text-right hidden sm:table-cell">{t("channel.uptime")}</TableHead>
                    <TableHead className="text-muted-foreground text-right">{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedChannels.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        {t("channel.noChannels")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedChannels.map((channel) => {
                      const status = statusConfig[channel.status as keyof typeof statusConfig];
                      return (
                        <TableRow 
                          key={channel.id} 
                          className="border-border/30 hover:bg-secondary/30 cursor-pointer"
                          onClick={() => navigate(`/channel/${channel.id}`)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${status.color} ${channel.status === "running" ? "animate-pulse-glow" : ""}`} />
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${channel.status === "error" ? "border-destructive text-destructive" : ""}`}
                              >
                                {status.label}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Radio className="w-4 h-4 text-primary" />
                              <span className="font-medium">{channel.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <code className="text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded">
                              {channel.input.length > 35 ? `${channel.input.slice(0, 35)}...` : channel.input}
                            </code>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-muted-foreground">
                            {channel.profile}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            {channel.bitrate}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm text-muted-foreground hidden sm:table-cell">
                            {channel.uptime}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                              {channel.status === "running" ? (
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8"
                                  onClick={() => handleStop(channel.id)}
                                >
                                  <Pause className="w-4 h-4" />
                                </Button>
                              ) : (
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8"
                                  onClick={() => handleStart(channel.id)}
                                >
                                  <Play className="w-4 h-4" />
                                </Button>
                              )}
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => handleConfigure(channel.id)}
                              >
                                <Settings2 className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Pagination - Only for table layout */}
          {totalPages > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="text-xs">{t("common.rows")}</span>
                  <Select value={String(recordsPerPage)} onValueChange={handleRecordsPerPageChange}>
                    <SelectTrigger className="w-16 h-8 text-xs bg-secondary/30 border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RECORDS_PER_PAGE_OPTIONS.map((option) => (
                        <SelectItem key={option} value={String(option)}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="hidden sm:block h-4 w-px bg-border/50" />
                <span className="text-xs">
                  {startIndex + 1}-{Math.min(endIndex, totalRecords)} {t("common.of")} {totalRecords}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handlePageChange(validCurrentPage - 1)}
                  disabled={validCurrentPage <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                {getPageNumbers().map((page, index) => (
                  page === "ellipsis" ? (
                    <span key={index} className="px-2 text-muted-foreground">...</span>
                  ) : (
                    <Button
                      key={index}
                      variant={page === validCurrentPage ? "secondary" : "ghost"}
                      size="icon"
                      className={`h-8 w-8 text-xs ${page === validCurrentPage ? "bg-primary/20 text-primary border border-primary/30" : ""}`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  )
                ))}
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handlePageChange(validCurrentPage + 1)}
                  disabled={validCurrentPage >= totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
