import { requestWithAuth } from "@/api/client";
import type {
  SchemaAnniversary,
  SchemaAnniversaryItemResponse,
  SchemaAnniversaryListResponse,
  SchemaAnniversaryPayload,
  SchemaAnniversaryRepeatType,
  SchemaAnniversaryType,
  SchemaMessageOnlyResponse,
} from "@/api/schemas";

export type AnniversaryType = SchemaAnniversaryType;
export type AnniversaryRepeatType = SchemaAnniversaryRepeatType;
export type AnniversaryItem = SchemaAnniversary;
export type AnniversaryPayload = SchemaAnniversaryPayload;

export function getAnniversaries() {
  return requestWithAuth<SchemaAnniversaryListResponse>("/anniversaries", {
    method: "GET",
  });
}

export function createAnniversary(payload: SchemaAnniversaryPayload) {
  return requestWithAuth<SchemaAnniversaryItemResponse>("/anniversaries", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateAnniversary(
  id: number,
  payload: SchemaAnniversaryPayload,
) {
  return requestWithAuth<SchemaAnniversaryItemResponse>(
    `/anniversaries/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export function deleteAnniversary(id: number) {
  return requestWithAuth<SchemaMessageOnlyResponse>(`/anniversaries/${id}`, {
    method: "DELETE",
  });
}
