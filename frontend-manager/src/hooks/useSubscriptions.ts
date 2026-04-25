import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { subscriptionsApi } from "@/api";

export function useManagerSubscriptions(page?: number) {
  return useQuery({
    queryKey: ["subscriptions", page],
    queryFn: async () => {
      const res = await subscriptionsApi.managerGetSubscriptions(page);
      return res.data;
    },
  });
}

export function useStudentSubscriptions(studentId: number | null) {
  return useQuery({
    queryKey: ["subscriptions", "student", studentId],
    queryFn: async () => {
      const res = await subscriptionsApi.managerGetSubscriptions();
      const all = res.data.results ?? [];
      return all.filter((s) => s.student === studentId);
    },
    enabled: studentId !== null,
  });
}

export function useAssignStudentLine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ studentId, lineId }: { studentId: number; lineId: number }) =>
      subscriptionsApi.managerAssignLine(studentId, lineId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
    },
  });
}
