import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "@/api";

export function useManagerNotifications() {
  return useQuery({
    queryKey: ["manager-notifications"],
    queryFn: async () => {
      const res = await notificationsApi.managerGetNotifications();
      return res.data;
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.managerMarkAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manager-notifications"] });
    },
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => notificationsApi.managerMarkNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manager-notifications"] });
    },
  });
}
