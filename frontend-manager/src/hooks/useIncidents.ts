import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { incidentsApi } from "@/api";
import type { IncidentRequest } from "@/api/types";

export function useIncidents(page?: number) {
  return useQuery({
    queryKey: ["incidents", page],
    queryFn: async () => {
      const res = await incidentsApi.managerGetIncidents(page);
      return res.data;
    },
  });
}

export function useCreateIncident() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: IncidentRequest) => incidentsApi.managerCreateIncident(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      queryClient.invalidateQueries({ queryKey: ["manager-dashboard"] });
    },
  });
}

export function useResolveIncident() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (incidentId: number) => incidentsApi.managerResolveIncident(incidentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      queryClient.invalidateQueries({ queryKey: ["manager-dashboard"] });
    },
  });
}

export function useRespondToIncident() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ incidentId, message }: { incidentId: number; message: string }) =>
      incidentsApi.managerRespondToIncident(incidentId, { message }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      queryClient.invalidateQueries({ queryKey: ["manager-dashboard"] });
    },
  });
}

/** Permanently delete one or more incidents (sequential DELETE calls). */
export function useDeleteIncidents() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (incidentIds: number[]) => {
      for (const id of incidentIds) {
        await incidentsApi.managerDeleteIncident(id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      queryClient.invalidateQueries({ queryKey: ["manager-dashboard"] });
    },
  });
}
