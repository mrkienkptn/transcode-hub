import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, RotateCcw, Square, Settings, Copy, QrCode, Volume2, VolumeX } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";

// Mock data - TODO: Replace with actual API calls
const mockChannelData = {
  id: 1,
  name: "Camera Sân Vườn",
  status: "running" as const,
  uptime: "2h 15m",
  speed: 1.25,
  fps: 30,
  bitrate: 4500,
  cpuUsage: 15,
  gpuUsage: 22,
  ffmpegPid: 89,
  input: {
    type: "RTMP",
    resolution: "1920x1080",
    codec: "H.264",
    fps: 30,
  },
  outputs: {
    hls: "http://192.168.1.10:8080/hls/cam1/index.m3u8",
    dash: "http://192.168.1.10:8080/dash/cam1/manifest.mpd",
    rtmp: "rtmp://youtube.com/live/...",
  },
};

// Generate mock chart data
const generateChartData = (baseValue: number, count: number = 20) => {
  return Array.from({ length: count }, (_, i) => ({
    time: i,
    value: baseValue + (Math.random() - 0.5) * (baseValue * 0.2),
  }));
};

// Speed Gauge Component
function SpeedGauge({ value }: { value: number }) {
  const getSpeedColor = () => {
    if (value < 1) return "text-destructive";
    if (value < 1.1) return "text-warning";
    return "text-success";
  };

  const getSpeedStatus = () => {
    if (value < 1) return "(Slow)";
    if (value < 1.1) return "(Normal)";
    return "(Good)";
  };

  // Calculate percentage for circular gauge (0-1.5 range mapped to 0-100%)
  const percentage = Math.min((value / 1.5) * 100, 100);
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="hsl(var(--secondary))"
            strokeWidth="8"
          />
          {/* Value circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={value < 1 ? "hsl(var(--destructive))" : value < 1.1 ? "hsl(var(--warning))" : "hsl(var(--success))"}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold ${getSpeedColor()}`}>
            {value.toFixed(2)}x
          </span>
          <span className={`text-xs ${getSpeedColor()}`}>
            {getSpeedStatus()}
          </span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-muted-foreground">SPEED GAUGE</p>
      </div>
    </div>
  );
}

// FPS Chart Component
function FPSChart({ fps, maxFps = 35 }: { fps: number; maxFps?: number }) {
  const data = generateChartData(fps, 20);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">FPS: {fps}</span>
      </div>
      <ResponsiveContainer width="100%" height={80}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="fpsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
              <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="time" hide />
          <YAxis hide domain={[0, maxFps]} />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            formatter={(value: number) => [`${value.toFixed(0)} fps`, "FPS"]}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="hsl(var(--success))"
            strokeWidth={2}
            fill="url(#fpsGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// Bitrate Chart Component
function BitrateChart({ bitrate, maxBitrate = 6000 }: { bitrate: number; maxBitrate?: number }) {
  const data = generateChartData(bitrate, 20);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Bitrate: {bitrate}k</span>
      </div>
      <ResponsiveContainer width="100%" height={80}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="bitrateGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="time" hide />
          <YAxis hide domain={[0, maxBitrate]} />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            formatter={(value: number) => [`${value.toFixed(0)}k`, "Bitrate"]}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fill="url(#bitrateGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DetailChannel() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [channel] = useState(mockChannelData); // TODO: Fetch from API using id
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedResolution, setSelectedResolution] = useState("auto");
  const [logs] = useState<string[]>([]); // TODO: Fetch logs from API

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  const handleRestart = () => {
    // TODO: Implement restart channel API call
    toast.info("Restarting channel...");
  };

  const handleStop = () => {
    // TODO: Implement stop channel API call
    toast.info("Stopping channel...");
  };

  const handleConfig = () => {
    // TODO: Navigate to config or open config modal
    toast.info("Opening configuration...");
  };

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Header with Back Button and Controls */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/channel")}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("common.back")}
          </Button>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">Channel Detail: {channel.name}</h1>
            {channel.status === "running" && (
              <Badge className="bg-green-500 text-destructive-foreground animate-pulse">
                LIVE
              </Badge>
            )}
            {channel.status === "running" && (
              <span className="text-sm text-muted-foreground">
                Uptime: {channel.uptime}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRestart}
            className="gap-2 border-warning text-warning hover:bg-warning/10"
          >
            <RotateCcw className="w-4 h-4" />
            {t("channel.restart")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleStop}
            className="gap-2 border-destructive text-destructive hover:bg-destructive/10"
          >
            <Square className="w-4 h-4" />
            {t("channel.stop")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleConfig}
            className="gap-2"
          >
            <Settings className="w-4 h-4" />
            {t("channel.config")}
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Player */}
        <div className="lg:col-span-1 space-y-6">
          {/* Video Player */}
          <Card className="glass-card">
            <CardContent className="p-0">
              <div className="aspect-video bg-secondary/50 flex items-center justify-center relative">
                {/* Placeholder for video player */}
                <div className="text-muted-foreground text-center">
                  <p className="text-lg font-medium mb-2">Video Player</p>
                  <p className="text-sm">Live stream preview</p>
                </div>
              </div>
              {/* Player Controls */}
              <div className="p-4 space-y-4 border-t border-border/50">
                {/* Resolution Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Resolution:</span>
                  <Select value={selectedResolution} onValueChange={setSelectedResolution}>
                    <SelectTrigger className="w-24 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto</SelectItem>
                      <SelectItem value="720p">720p</SelectItem>
                      <SelectItem value="480p">480p</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {/* Audio Controls */}
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMuted(!isMuted)}
                    className="h-8 w-8"
                  >
                    {isMuted ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </Button>
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    onValueChange={(value) => {
                      setVolume(value[0]);
                      setIsMuted(value[0] === 0);
                    }}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  {/* Audio VU Meter */}
                  <div className="flex items-center gap-1 h-4">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-success rounded-full transition-all"
                        style={{
                          height: `${Math.random() * 100}%`,
                          opacity: i < 7 ? 1 : 0.5,
                        }}
                      />
                    ))}
                  </div>
                </div>
                {/* Input Details */}
                <div className="text-xs text-muted-foreground">
                  Input: {channel.input.type} | {channel.input.resolution} | {channel.input.codec} | {channel.input.fps}fps
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Output Links */}
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">[ OUTPUT LINKS ]</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* HLS Master */}
              <div className="space-y-2">
                <label className="text-sm font-medium">HLS Master:</label>
                <div className="flex items-center gap-2">
                  <Input
                    value={channel.outputs.hls}
                    readOnly
                    className="flex-1 font-mono text-xs bg-secondary/30"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(channel.outputs.hls, "HLS Master")}
                    className="gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </Button>
                  <Button variant="outline" size="icon" className="h-9 w-9">
                    <QrCode className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {/* DASH Manifest */}
              <div className="space-y-2">
                <label className="text-sm font-medium">DASH Manifest:</label>
                <div className="flex items-center gap-2">
                  <Input
                    value={channel.outputs.dash}
                    readOnly
                    className="flex-1 font-mono text-xs bg-secondary/30"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(channel.outputs.dash, "DASH Manifest")}
                    className="gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </Button>
                </div>
              </div>
              {/* RTMP Push */}
              <div className="space-y-2">
                <label className="text-sm font-medium">RTMP Push:</label>
                <div className="flex items-center gap-2">
                  <Input
                    value={channel.outputs.rtmp}
                    readOnly
                    className="flex-1 font-mono text-xs bg-secondary/30"
                  />
                  <Button variant="outline" size="sm" className="gap-2">
                    Show
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Real-time Health */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Real-time Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Speed Gauge - Full width on mobile, spans 2 columns on larger screens */}
                <div className="md:col-span-2 flex justify-center">
                  <SpeedGauge value={channel.speed} />
                </div>

                {/* FPS Chart */}
                <div className="space-y-2">
                  <FPSChart fps={channel.fps} />
                </div>

                {/* Bitrate Chart */}
                <div className="space-y-2">
                  <BitrateChart bitrate={channel.bitrate} />
                </div>

                {/* CPU Usage */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">
                      CPU Usage: {channel.cpuUsage}% (FFmpeg PID: {channel.ffmpegPid})
                    </span>
                  </div>
                  <Progress value={channel.cpuUsage} className="h-2" />
                </div>

                {/* GPU Usage */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">GPU: {channel.gpuUsage}%</span>
                  </div>
                  <Progress value={channel.gpuUsage} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Live Logs */}
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">[ LIVE LOGS ]</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 overflow-y-auto scrollbar-thin bg-secondary/20 rounded p-3 font-mono text-xs">
                {logs.length === 0 ? (
                  <div className="text-muted-foreground text-center py-8">
                    No logs available
                  </div>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className="mb-1">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
