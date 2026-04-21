import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { busesApi } from "@/api";
import type { BusRequest, BusAssignmentRequest } from "@/api/types";

export function useBuses(page?: number) {
  return useQuery({
    queryKey: ["buses", page],
    queryFn: async () => {
      const res = await busesApi.managerGetBuses(page);
      return res.data;
    },
  });
}

export function useBusAssignments(page?: number) {
  return useQuery({
    queryKey: ["bus-assignments", page],
    queryFn: async () => {
      const res = await busesApi.managerGetBusAssignments(page);
      return res.data;
    },
  });
}

export function useCreateBus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BusRequest) => busesApi.managerCreateBus(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buses"] });
    },
  });
}

export function useCreateBusAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BusAssignmentRequest) => busesApi.managerCreateBusAssignment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bus-assignments"] });
      queryClient.invalidateQueries({ queryKey: ["buses"] });
    },
  });
}

export function usePatchBus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof busesApi.managerPatchBus>[1] }) =>
      busesApi.managerPatchBus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buses"] });
    },
  });
}

export function useDeleteBus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => busesApi.managerDeleteBus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buses"] });
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
    },
  });
}
