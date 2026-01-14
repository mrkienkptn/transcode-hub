import { useQuery } from '@tanstack/react-query';
import { getMachineInfo, MachineInfo } from '@/api/machine';

export function useMachineInfo() {
  return useQuery<MachineInfo | null, Error>({
    queryKey: ['machineInfo'],
    queryFn: async () => {
      const { data, error } = await getMachineInfo();
      if (error) throw new Error(error);
      return data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    retry: 2,
  });
}
