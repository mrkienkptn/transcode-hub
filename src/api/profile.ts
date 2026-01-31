import { fetchApi, ApiResponse } from '@/lib/api';

export interface Profile {
  id: number;
  name: string;
  is_active?: boolean;
  isSystem?: boolean;
  codec?: string;
  width?: number;
  height?: number;
  fps?: number;
  video_bitrate?: number;
  gop_size?: number;
  preset?: string;
  profile?: string;
  audio_codec?: string;
  audio_bitrate?: number;
  sample_rate?: number;
  created_at?: string;
}

export async function createProfile(profile: Profile): Promise<ApiResponse<Profile>> {
  return fetchApi<Profile>('/profiles', {
    method: 'POST',
    body: JSON.stringify(profile),
  });
}

export async function updateProfile(id: number, profile: Profile): Promise<ApiResponse<Profile>> {
  return fetchApi<Profile>(`/profiles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(profile),
  });
}

export async function deleteProfile(id: number): Promise<ApiResponse<void>> {
  return fetchApi<void>(`/profiles/${id}`, {
    method: 'DELETE',
  });
}

export async function getProfiles(): Promise<ApiResponse<Profile[]>> {
  return fetchApi<Profile[]>('/profiles');
}
