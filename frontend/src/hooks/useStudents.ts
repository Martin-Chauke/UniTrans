import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { accountsApi } from "@/api";
import type { PatchedStudentDetailRequest } from "@/api/types";

export function useStudents(page?: number) {
  return useQuery({
    queryKey: ["students", page],
    queryFn: async () => {
      const res = await accountsApi.getStudents(page);
      return res.data;
    },
  });
}

export function useStudent(studentId: number | null) {
  return useQuery({
    queryKey: ["student", studentId],
    queryFn: async () => {
      const res = await accountsApi.getStudent(studentId!);
      return res.data;
    },
    enabled: studentId !== null,
  });
}

export function usePatchStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PatchedStudentDetailRequest }) =>
      accountsApi.patchStudent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}

export function useDeleteStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => accountsApi.deleteStudent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}
