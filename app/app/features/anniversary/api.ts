import { requestWithAuth } from "@/app/shared/api-client";

export type AnniversaryType = "love" | "birthday" | "holiday" | "custom";
export type AnniversaryRepeatType = "none" | "yearly";

export interface AnniversaryItem {
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
}

interface GetAnniversariesResponse {
  message: string;
  anniversaries: AnniversaryItem[];
  timeZone: string | null;
  todayDate: string | null;
}

interface CreateAnniversaryResponse {
  message: string;
  anniversary: AnniversaryItem;
}

interface MessageResponse {
  message: string;
}

export interface CreateAnniversaryPayload {
  title: string;
  type: AnniversaryType;
  originalDate: string;
  repeatType: AnniversaryRepeatType;
  reminderDaysBefore: number;
}

export async function getAnniversaries() {
  return requestWithAuth<GetAnniversariesResponse>("/anniversaries", {
    method: "GET",
  });
}

export async function createAnniversary(payload: CreateAnniversaryPayload) {
  return requestWithAuth<CreateAnniversaryResponse>("/anniversaries", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAnniversary(
  anniversaryId: number,
  payload: CreateAnniversaryPayload,
) {
  return requestWithAuth<CreateAnniversaryResponse>(
    `/anniversaries/${anniversaryId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export async function deleteAnniversary(anniversaryId: number) {
  return requestWithAuth<MessageResponse>(`/anniversaries/${anniversaryId}`, {
    method: "DELETE",
  });
}
