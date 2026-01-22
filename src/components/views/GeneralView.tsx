import { Info, Key, Server, Clock, RefreshCw, Cpu, HardDrive, Network, Activity, Box } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMachineInfo } from "@/hooks/useMachineInfo";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

function formatDate(dateString: string | undefined): string {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString();
}

function formatUptime(startDate: string | undefined): string {
  if (!startDate) return 'N/A';
  const start = new Date(startDate);
  const now = new Date();
  const diff = now.getTime() - start.getTime();
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function GeneralView() {
  const { t } = useTranslation();
  const { data: machineInfo, isLoading, error, refetch, isFetching } = useMachineInfo();

  const ramUsagePercent = machineInfo?.system 
    ? (machineInfo.system.ramUsed / machineInfo.system.ramTotal) * 100 
    : 0;

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Application Info */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              {t("general.applicationInfo")}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => refetch()}
              disabled={isFetching}
              className="h-8 w-8"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-4">
              <p className="text-destructive text-sm">{t("general.failedToLoad")}</p>
              <p className="text-muted-foreground text-xs mt-1">{error.message}</p>
            </div>
          ) : isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="stat-card">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-5 w-32" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="stat-card">
                <p className="metric-label">{t("general.name")}</p>
                <p className="metric-value">{machineInfo?.name ?? 'N/A'}</p>
              </div>
              <div className="stat-card">
                <p className="metric-label">{t("general.version")}</p>
                <p className="metric-value">{machineInfo?.version ?? 'N/A'}</p>
              </div>
              <div className="stat-card">
                <p className="metric-label">{t("general.branch")}</p>
                <Badge variant="secondary">{machineInfo?.branch ?? 'N/A'}</Badge>
              </div>
              <div className="stat-card">
                <p className="metric-label">{t("general.build")}</p>
                <p className="metric-value font-mono text-sm">{formatDate(machineInfo?.build)}</p>
              </div>
              <div className="stat-card">
                <p className="metric-label">{t("general.startTime")}</p>
                <p className="metric-value font-mono text-sm">{formatDate(machineInfo?.start)}</p>
              </div>
              <div className="stat-card">
                <p className="metric-label">{t("general.uptime")}</p>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <p className="metric-value">{formatUptime(machineInfo?.start)}</p>
                </div>
              </div>
              <div className="stat-card">
                <p className="metric-label">{t("general.timezone")}</p>
                <p className="metric-value text-sm">{machineInfo?.timezone ?? 'N/A'}</p>
              </div>
            </div>
          )}
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
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="stat-card">
            <p className="metric-label">License Status</p>
            <Badge variant={machineInfo?.licenseStatus === 'VALID' ? 'default' : 'destructive'}>
              {machineInfo?.licenseStatus ?? 'N/A'}
            </Badge>
          </div>
          <div className="stat-card">
            <p className="metric-label">License Key</p>
            <p className="metric-value text-sm font-mono text-muted-foreground">
              {machineInfo?.nats?.license ?? 'N/A'}
            </p>
          </div>
          <div className="stat-card">
            <p className="metric-label">Total Tasks</p>
            <p className="metric-value">{machineInfo?.total ?? 0}</p>
          </div>
          <div className="stat-card">
            <p className="metric-label">Queue</p>
            <p className="metric-value">{machineInfo?.queue ?? 0}</p>
          </div>
        </CardContent>
      </Card>

      {/* Task Status */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="w-4 h-4 text-primary" />
            Task Status
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <div className="stat-card">
            <p className="metric-label">Preparing</p>
            <p className="metric-value text-warning">{machineInfo?.task?.preparing ?? 0}</p>
          </div>
          <div className="stat-card">
            <p className="metric-label">Error</p>
            <p className="metric-value text-destructive">{machineInfo?.task?.error ?? 0}</p>
          </div>
          <div className="stat-card">
            <p className="metric-label">PTE</p>
            <p className="metric-value">{machineInfo?.pte ?? 0}</p>
          </div>
          <div className="stat-card">
            <p className="metric-label">DNN</p>
            <p className="metric-value">{machineInfo?.dnn ?? 0}</p>
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
            <p className="text-foreground font-mono text-sm">{machineInfo?.hostname ?? 'N/A'}</p>
          </div>
          <div className="stat-card">
            <p className="metric-label">OS</p>
            <p className="text-foreground text-sm">{machineInfo?.system?.os ?? 'N/A'}</p>
          </div>
          <div className="stat-card">
            <p className="metric-label">CPU Cores</p>
            <p className="text-foreground font-mono">{machineInfo?.system?.cores ?? 'N/A'}</p>
          </div>
          <div className="stat-card">
            <p className="metric-label">Threads</p>
            <p className="text-foreground font-mono">{machineInfo?.system?.thread ?? 'N/A'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Resource Usage */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Cpu className="w-4 h-4 text-primary" />
            Resource Usage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="stat-card space-y-3">
              <div className="flex justify-between items-center">
                <p className="metric-label">RAM Usage</p>
                <span className="text-sm text-muted-foreground">
                  {machineInfo?.system?.ramUsed ?? 0} / {machineInfo?.system?.ramTotal ?? 0} MB
                </span>
              </div>
              <Progress value={ramUsagePercent} className="h-2" />
            </div>
            <div className="stat-card space-y-3">
              <div className="flex justify-between items-center">
                <p className="metric-label">Swap Usage</p>
                <span className="text-sm text-muted-foreground">
                  {machineInfo?.system?.swapUsed ?? 0} / {machineInfo?.system?.swapTotal ?? 0} MB
                </span>
              </div>
              <Progress 
                value={machineInfo?.system?.swapTotal ? (machineInfo.system.swapUsed / machineInfo.system.swapTotal) * 100 : 0} 
                className="h-2" 
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="stat-card">
              <p className="metric-label">{t("general.cpuUsage")}</p>
              <p className="metric-value">{machineInfo?.system?.cpu ?? 0}{t("general.percent")}</p>
            </div>
            <div className="stat-card">
              <p className="metric-label">{t("general.heapUsed")}</p>
              <p className="metric-value font-mono">{machineInfo?.system?.heapUsed ?? 0} {t("general.mb")}</p>
            </div>
            <div className="stat-card">
              <p className="metric-label">{t("general.heapMax")}</p>
              <p className="metric-value font-mono">{machineInfo?.system?.heapMax ?? 0} {t("general.mb")}</p>
            </div>
          </div>
          {machineInfo?.system?.process && (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="stat-card">
                <p className="metric-label">{t("general.processPid")}</p>
                <p className="metric-value font-mono">{machineInfo.system.process.pid}</p>
              </div>
              <div className="stat-card">
                <p className="metric-label">{t("general.processCpu")}</p>
                <p className="metric-value">{machineInfo.system.process.cpu}</p>
              </div>
              <div className="stat-card">
                <p className="metric-label">{t("general.processRam")}</p>
                <p className="metric-value">{machineInfo.system.process.ram}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Network Interfaces */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Network className="w-4 h-4 text-primary" />
            {t("general.networkInterfaces")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {machineInfo?.system?.network?.filter(n => !n.loopback).map((net, idx) => (
              <div key={idx} className="stat-card flex justify-between items-center">
                <div>
                  <p className="font-medium text-foreground">{net.name}</p>
                  <p className="text-sm text-muted-foreground font-mono">{net.netmask}</p>
                </div>
                <p className="font-mono text-primary">{net.ip}</p>
              </div>
            )) ?? <p className="text-muted-foreground text-sm">{t("general.noNetworkInterfaces")}</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
