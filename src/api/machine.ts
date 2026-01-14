import { fetchApi, ApiResponse } from '@/lib/api';

export interface NetworkInterface {
  name: string;
  ip: string;
  netmask: string;
  loopback?: boolean;
}

export interface StorageInfo {
  name: string;
  folder: string[];
  skip: string[];
  expire: string;
  interval: string;
  fps: number;
  cache: number;
}

export interface MonitorInfo {
  name: string;
  timeout: number;
  delay: number;
  error: number;
  thread: number;
}

export interface ProcessInfo {
  pid: number;
  cpu: string;
  ram: string;
  child?: number;
}

export interface SystemInfo {
  os: string;
  cores: number;
  cpu: number;
  thread: number;
  heapUsed: number;
  heapCommit: number;
  heapMax: number;
  ramTotal: number;
  ramUsed: number;
  swapTotal: number;
  swapUsed: number;
  updateTime: string;
  monitor: MonitorInfo[];
  network: NetworkInterface[];
  storage: StorageInfo[];
  log: {
    folder: string;
    used: number;
  };
  gpu: string[];
  encoder: {
    name: string;
    codec: string;
    bframe: number;
    preset: string;
    format: { format: string; profile: string }[];
    level: string;
  }[];
  process: ProcessInfo;
}

export interface AppInfo {
  name: string;
  state: 'running' | 'error' | 'stopped';
  life?: string;
  process: ProcessInfo;
}

export interface TaskInfo {
  preparing: number;
  error: number;
}

export interface NatsInfo {
  id: string;
  license: string;
  hook: number;
  startup: string;
  connected: number;
}

export interface MachineInfo {
  name: string;
  version: string;
  branch: string;
  speed: number;
  build: string;
  start: string;
  local: string;
  timezone: string;
  hostname: string;
  port: number;
  queue: number;
  pte: number;
  dnn: number;
  total: number;
  task: TaskInfo;
  supported: string[];
  system: SystemInfo;
  apps: AppInfo[];
  nats: NatsInfo;
  licenseStatus: string;
  ec: number;
  result: Record<string, unknown>;
  dt: number;
  now: string;
}

export async function getMachineInfo(): Promise<ApiResponse<MachineInfo>> {
  return fetchApi<MachineInfo>('/machine-info');
}
