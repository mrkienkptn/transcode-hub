import { Plus, Search, Play, Pause, Square, Settings2, Trash2, Radio } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

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

const statusConfig = {
  running: { color: "bg-success", label: "Running", icon: Play },
  idle: { color: "bg-warning", label: "Idle", icon: Pause },
  error: { color: "bg-destructive", label: "Error", icon: Square },
};

const DEFAULT_PAGE = 1;
const DEFAULT_RECORDS_PER_PAGE = 5;
const RECORDS_PER_PAGE_OPTIONS = [5, 10, 20, 50];

export function ChannelManager() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get params from URL
  const nameFilter = searchParams.get("name") || "";
  const currentPage = parseInt(searchParams.get("p") || String(DEFAULT_PAGE), 10);
  const recordsPerPage = parseInt(searchParams.get("r") || String(DEFAULT_RECORDS_PER_PAGE), 10);

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

  // Pagination calculations
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

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search channels..." 
            className="pl-10 bg-secondary/50 border-border/50"
            value={nameFilter}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Channel
        </Button>
      </div>

      {/* Channels Table */}
      <Card className="glass-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Channel</TableHead>
                <TableHead className="text-muted-foreground hidden md:table-cell">Input</TableHead>
                <TableHead className="text-muted-foreground hidden lg:table-cell">Profile</TableHead>
                <TableHead className="text-muted-foreground text-right">Bitrate</TableHead>
                <TableHead className="text-muted-foreground text-right hidden sm:table-cell">Uptime</TableHead>
                <TableHead className="text-muted-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedChannels.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No channels found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedChannels.map((channel) => {
                  const status = statusConfig[channel.status as keyof typeof statusConfig];
                  return (
                    <TableRow key={channel.id} className="border-border/30 hover:bg-secondary/30">
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
                        <div className="flex justify-end gap-1">
                          {channel.status === "running" ? (
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Pause className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Play className="w-4 h-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-8 w-8">
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

      {/* Pagination */}
      {totalPages > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Show</span>
            <Select value={String(recordsPerPage)} onValueChange={handleRecordsPerPageChange}>
              <SelectTrigger className="w-20 h-8">
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
            <span>per page</span>
            <span className="ml-4">
              Showing {startIndex + 1}-{Math.min(endIndex, totalRecords)} of {totalRecords}
            </span>
          </div>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => handlePageChange(validCurrentPage - 1)}
                  className={validCurrentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {getPageNumbers().map((page, index) => (
                <PaginationItem key={index}>
                  {page === "ellipsis" ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      onClick={() => handlePageChange(page)}
                      isActive={page === validCurrentPage}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => handlePageChange(validCurrentPage + 1)}
                  className={validCurrentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
