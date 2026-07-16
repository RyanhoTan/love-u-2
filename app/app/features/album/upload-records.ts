import { useSyncExternalStore } from "react";
import type { PickedMediaItem } from "@/hooks";

export type AlbumUploadRecordStatus = "uploading" | "success" | "failed";

export interface AlbumUploadRecordFile {
  id: string;
  name: string;
  type: "image" | "video";
  uri: string;
}

export interface AlbumUploadRecord {
  id: string;
  fileCount: number;
  files: AlbumUploadRecordFile[];
  status: AlbumUploadRecordStatus;
  startedAt: string;
  completedAt?: string;
  errorMessage?: string;
}

let records: AlbumUploadRecord[] = [];

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function updateRecord(
  id: string,
  updater: (record: AlbumUploadRecord) => AlbumUploadRecord,
) {
  records = records.map((record) =>
    record.id === id ? updater(record) : record,
  );
  emitChange();
}

function getFileName(asset: PickedMediaItem, index: number) {
  if (asset.fileName && asset.fileName.trim()) {
    return asset.fileName;
  }

  const uriParts = asset.uri.split(/[\\/]/).filter(Boolean);
  const uriName = uriParts.at(-1);

  if (uriName) {
    return uriName;
  }

  return `file-${index + 1}.${asset.type === "image" ? "jpg" : "mp4"}`;
}

export function createAlbumUploadRecord(assets: PickedMediaItem[]) {
  const record: AlbumUploadRecord = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    fileCount: assets.length,
    files: assets.map((asset, index) => ({
      id: asset.id,
      name: getFileName(asset, index),
      type: asset.type,
      uri: asset.uri,
    })),
    status: "uploading",
    startedAt: new Date().toISOString(),
  };

  records = [record, ...records];
  emitChange();

  return record.id;
}

export function markAlbumUploadRecordSuccess(id: string) {
  updateRecord(id, (record) => ({
    ...record,
    status: "success",
    completedAt: new Date().toISOString(),
    errorMessage: undefined,
  }));
}

export function markAlbumUploadRecordFailed(id: string, errorMessage: string) {
  updateRecord(id, (record) => ({
    ...record,
    status: "failed",
    completedAt: new Date().toISOString(),
    errorMessage,
  }));
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return records;
}

export function useAlbumUploadRecords() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
