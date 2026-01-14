const API_BASE_URL = 'http://localhost:9999';

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

export interface MachineInfo {
  hostname: string;
  ipAddress: string;
  uptime: string;
  os: string;
}

export async function getMachineInfo(): Promise<ApiResponse<MachineInfo>> {
  return fetchApi<MachineInfo>('/machine-info');
}
