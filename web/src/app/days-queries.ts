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
} from "./days-api";

export const daysKeys = {
  all: ["anniversaries"] as const,
};

export function useAnniversariesQuery() {
  return useQuery({
    queryKey: daysKeys.all,
    queryFn: getAnniversaries,
  });
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
