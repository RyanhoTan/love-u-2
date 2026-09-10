import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createWish,
  createWishRecord,
  getWishById,
  getWishRecords,
  getWishes,
  updateWish,
  type CreateWishPayload,
  type CreateWishRecordPayload,
  type UpdateWishPayload,
} from "@/api/wish";

export const wishKeys = {
  all: ["wishes"] as const,
  detail: (id: number) => ["wishes", id] as const,
  records: (id: number) => ["wishes", id, "records"] as const,
};

export function useWishesQuery() {
  return useQuery({
    queryKey: wishKeys.all,
    queryFn: getWishes,
  });
}

export function useWishQuery(id: number) {
  return useQuery({
    queryKey: wishKeys.detail(id),
    queryFn: () => getWishById(id),
    enabled: Number.isInteger(id) && id > 0,
  });
}

export function useWishRecordsQuery(id: number) {
  return useQuery({
    queryKey: wishKeys.records(id),
    queryFn: () => getWishRecords(id),
    enabled: Number.isInteger(id) && id > 0,
  });
}

export function useCreateWishMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateWishPayload) => createWish(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: wishKeys.all });
    },
  });
}

export function useUpdateWishMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateWishPayload;
    }) => updateWish(id, payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: wishKeys.all });
      void queryClient.invalidateQueries({
        queryKey: wishKeys.detail(variables.id),
      });
      void queryClient.invalidateQueries({
        queryKey: wishKeys.records(variables.id),
      });
    },
  });
}

export function useCreateWishRecordMutation(wishId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateWishRecordPayload) =>
      createWishRecord(wishId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: wishKeys.all });
      void queryClient.invalidateQueries({
        queryKey: wishKeys.detail(wishId),
      });
      void queryClient.invalidateQueries({
        queryKey: wishKeys.records(wishId),
      });
    },
  });
}

export function errorMessage(error: unknown, fallback = "request failed") {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}
