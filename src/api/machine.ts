import { fetchApi, ApiResponse } from '@/lib/api';

export interface MachineInfo {
  hostname: string;
  ipAddress: string;
  uptime: string;
  os: string;
}

export async function getMachineInfo(): Promise<ApiResponse<MachineInfo>> {
  return fetchApi<MachineInfo>('/machine-info');
}
