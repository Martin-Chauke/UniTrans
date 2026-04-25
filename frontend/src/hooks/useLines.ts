import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { linesApi } from "@/api";
import type { LineWriteRequest, PatchedLineWriteRequest, StationRequest, LineStationRequest } from "@/api/types";

export function useLines() {
  return useQuery({
    queryKey: ["lines"],
    queryFn: async () => {
      const res = await linesApi.managerGetLines();
      return res.data;
    },
  });
}

export function useCreateLine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: LineWriteRequest) => linesApi.managerCreateLine(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lines"] });
    },
  });
}

export function useUpdateLine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PatchedLineWriteRequest }) =>
      linesApi.managerPatchLine(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lines"] });
    },
  });
}

export function useDeleteLine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => linesApi.managerDeleteLine(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lines"] });
    },
  });
}

export function useCreateStation() {
  return useMutation({
    mutationFn: (data: StationRequest) => linesApi.managerCreateStation(data),
  });
}

export function useAddStationToLine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ lineId, data }: { lineId: number; data: LineStationRequest }) =>
      linesApi.managerAddStationToLine(lineId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lines"] });
    },
  });
}

export function useLineStations(lineId: number | null) {
  return useQuery({
    queryKey: ["line-stations", lineId],
    queryFn: async () => {
      const res = await linesApi.managerGetLineStations(lineId!);
      return res.data;
    },
    enabled: lineId !== null,
  });
}
