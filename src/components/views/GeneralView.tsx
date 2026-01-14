import { Info, Key, User, Server, Clock, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function GeneralView() {
  return (
    <div className="space-y-6 animate-slide-in">
      {/* Application Info */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Info className="w-4 h-4 text-primary" />
            Application Info
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="stat-card">
            <p className="metric-label">Version</p>
            <p className="metric-value">2.4.1</p>
          </div>
          <div className="stat-card">
            <p className="metric-label">Build</p>
            <p className="metric-value font-mono text-lg">b2024.01.15</p>
          </div>
          <div className="stat-card">
            <p className="metric-label">Status</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse-glow" />
              <span className="metric-value text-success">Active</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* License Info */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Key className="w-4 h-4 text-primary" />
            License
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="stat-card">
            <p className="metric-label">License Type</p>
            <p className="metric-value text-lg">Enterprise</p>
          </div>
          <div className="stat-card">
            <p className="metric-label">Valid Until</p>
            <p className="metric-value text-lg font-mono">2025-12-31</p>
          </div>
          <div className="stat-card">
            <p className="metric-label">Max Channels</p>
            <p className="metric-value">128</p>
          </div>
          <div className="stat-card">
            <p className="metric-label">License Key</p>
            <p className="metric-value text-sm font-mono text-muted-foreground">
              XXXX-XXXX-XXXX-7A3F
            </p>
          </div>
        </CardContent>
      </Card>

      {/* User Info */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="w-4 h-4 text-primary" />
            User Info
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1 grid gap-3 md:grid-cols-2">
              <div>
                <p className="metric-label">Username</p>
                <p className="text-foreground font-medium">Administrator</p>
              </div>
              <div>
                <p className="metric-label">Email</p>
                <p className="text-foreground font-medium">admin@transcoder.io</p>
              </div>
              <div>
                <p className="metric-label">Role</p>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-sm">
                  <Shield className="w-3 h-3" />
                  Super Admin
                </span>
              </div>
              <div>
                <p className="metric-label">Last Login</p>
                <p className="text-muted-foreground text-sm font-mono">2024-01-14 09:32:15</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Server Info */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Server className="w-4 h-4 text-primary" />
            Server Info
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="stat-card">
            <p className="metric-label">Hostname</p>
            <p className="text-foreground font-mono text-sm">transcoder-prod-01</p>
          </div>
          <div className="stat-card">
            <p className="metric-label">IP Address</p>
            <p className="text-foreground font-mono text-sm">192.168.1.100</p>
          </div>
          <div className="stat-card">
            <p className="metric-label">Uptime</p>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <p className="text-foreground font-mono text-sm">45d 12h 32m</p>
            </div>
          </div>
          <div className="stat-card">
            <p className="metric-label">OS</p>
            <p className="text-foreground text-sm">Ubuntu 22.04 LTS</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
