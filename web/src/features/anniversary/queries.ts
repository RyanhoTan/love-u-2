import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createAnniversary,
  deleteAnniversary,
  getAnniversaries,
  updateAnniversary,
  type AnniversaryPayload,
} from "@/api/anniversary";
import { useCalendarRefresh } from "./calendar-refresh";
import { anniversaryQueryKey } from "./query-scope";
import { useAuth } from "@/features/auth/context";

export const daysKeys = {
  all: ["anniversaries"] as const,
};

export function useAnniversariesQuery() {
  const { user } = useAuth();
  const query = useQuery({
    queryKey: anniversaryQueryKey(user?.id, user?.couple?.partner?.id),
    queryFn: getAnniversaries,
    enabled: Boolean(user?.id),
  });
  useCalendarRefresh(query.data?.timeZone, query.data?.todayDate, () => query.refetch());
  return query;
}

export function useCreateAnniversaryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AnniversaryPayload) => createAnniversary(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: daysKeys.all });
    },
  });
}

export function useUpdateAnniversaryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: AnniversaryPayload;
    }) => updateAnniversary(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: daysKeys.all });
    },
  });
}

export function useDeleteAnniversaryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteAnniversary(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: daysKeys.all });
    },
  });
}

export function errorMessage(error: unknown, fallback = "request failed") {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}
