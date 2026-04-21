import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tripsApi } from "@/api";
import type { TripWriteRequest } from "@/api/types";

export function useTrips(page?: number) {
  return useQuery({
    queryKey: ["trips", page],
    queryFn: async () => {
      const res = await tripsApi.managerGetTrips(page);
      return res.data;
    },
  });
}

export function useTrip(tripId: number | null) {
  return useQuery({
    queryKey: ["trip", tripId],
    queryFn: async () => {
      const res = await tripsApi.managerGetTrip(tripId!);
      return res.data;
    },
    enabled: tripId !== null,
  });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TripWriteRequest) => tripsApi.managerCreateTrip(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
  });
}

export function useStartTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tripId: number) => tripsApi.managerStartTrip(tripId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
  });
}

export function useEndTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tripId: number) => tripsApi.managerEndTrip(tripId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
  });
}
