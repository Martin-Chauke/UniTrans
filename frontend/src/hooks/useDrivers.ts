import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { driversApi } from "@/api";
import type { DriverRequest, PatchedDriverRequest } from "@/api/types";

export function useDrivers(page?: number) {
  return useQuery({
    queryKey: ["drivers", page],
    queryFn: async () => {
      const res = await driversApi.managerGetDrivers(page);
      return res.data;
    },
  });
}

export function useDriver(driverId: number | null) {
  return useQuery({
    queryKey: ["driver", driverId],
    queryFn: async () => {
      const res = await driversApi.managerGetDriver(driverId!);
      return res.data;
    },
    enabled: driverId !== null,
  });
}

export function useCreateDriver() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DriverRequest) => driversApi.managerCreateDriver(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
    },
  });
}

export function usePatchDriver() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PatchedDriverRequest }) =>
      driversApi.managerPatchDriver(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
    },
  });
}

export function useDeleteDriver() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => driversApi.managerDeleteDriver(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
    },
  });
}
