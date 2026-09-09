import { requestWithAuth } from "@/lib/api";

export type AnniversaryType = "love" | "birthday" | "holiday" | "custom";
export type AnniversaryRepeatType = "none" | "yearly";

export type AnniversaryItem = {
  id: number;
  relationshipId: number;
  createdByUserId: number | null;
  title: string;
  type: AnniversaryType;
  originalDate: string;
  repeatType: AnniversaryRepeatType;
  reminderDaysBefore: number;
  status: "active" | "deleted";
  nextOccurrenceDate: string;
  remainingDays: number;
  createdAt: string | null;
  updatedAt: string | null;
  deletedAt: string | null;
};

export type AnniversaryPayload = {
  title: string;
  type: AnniversaryType;
  originalDate: string;
  repeatType: AnniversaryRepeatType;
  reminderDaysBefore: number;
};

type ListResponse = {
  message: string;
  anniversaries: AnniversaryItem[];
};

type ItemResponse = {
  message: string;
  anniversary: AnniversaryItem;
};

export function getAnniversaries() {
  return requestWithAuth<ListResponse>("/anniversaries", {
    method: "GET",
  });
}

export function createAnniversary(payload: AnniversaryPayload) {
  return requestWithAuth<ItemResponse>("/anniversaries", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateAnniversary(id: number, payload: AnniversaryPayload) {
  return requestWithAuth<ItemResponse>(`/anniversaries/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteAnniversary(id: number) {
  return requestWithAuth<{ message: string }>(`/anniversaries/${id}`, {
    method: "DELETE",
  });
}
