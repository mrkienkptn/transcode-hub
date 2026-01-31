import { fetchApi, ApiResponse } from '@/lib/api';

export interface CreateChannelRequest {
  name: string;
  input: string;
  profiles?: number[];
  target?: string[];
  token?: string;
}

export interface Channel {
  id: number;
  name: string;
  input: string;
  profiles?: number[];
  target?: string[];
  token?: string;
  status?: string;
  thumbnail?: string;
}

export async function createChannel(channel: CreateChannelRequest): Promise<ApiResponse<Channel>> {
  return fetchApi<Channel>('/channels', {
    method: 'POST',
    body: JSON.stringify(channel),
  });
}

export async function getChannels(): Promise<ApiResponse<Channel[]>> {
  return fetchApi<Channel[]>('/channels');
}

export async function getChannel(id: number): Promise<ApiResponse<Channel>> {
  return fetchApi<Channel>(`/channels/${id}`);
}

export async function updateChannel(id: number, channel: Partial<CreateChannelRequest>): Promise<ApiResponse<Channel>> {
  return fetchApi<Channel>(`/channels/${id}`, {
    method: 'PUT',
    body: JSON.stringify(channel),
  });
}

export async function deleteChannel(id: number): Promise<ApiResponse<void>> {
  return fetchApi<void>(`/channels/${id}`, {
    method: 'DELETE',
  });
}

export async function startChannel(id: number): Promise<ApiResponse<void>> {
  return fetchApi<void>(`/channels/${id}/actions/start`, {
    method: 'POST',
  });
}

export async function stopChannel(id: number): Promise<ApiResponse<void>> {
  return fetchApi<void>(`/channels/${id}/actions/stop`, {
    method: 'POST',
  });
}
