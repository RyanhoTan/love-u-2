import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { HttpError } from "../src/errors.js";
import {
  getMediaUploadPolicy,
  MAX_MEDIA_UPLOAD_BYTES,
} from "../src/media/uploadPolicy.js";

describe("media upload policy", () => {
  it("allows supported image, video, and audio MIME types for their folders", () => {
    assert.deepEqual(getMediaUploadPolicy("album", "image/jpeg", 10), {
      folder: "album",
      contentType: "image/jpeg",
      extension: "jpg",
    });
    assert.deepEqual(getMediaUploadPolicy("album", "video/mp4", 10), {
      folder: "album",
      contentType: "video/mp4",
      extension: "mp4",
    });
    assert.deepEqual(
      getMediaUploadPolicy("interact", "audio/webm;codecs=opus", 10),
      {
        folder: "interact",
        contentType: "audio/webm",
        extension: "webm",
      },
    );
  });

  it("ignores MIME parameters and case when selecting a safe extension", () => {
    assert.deepEqual(
      getMediaUploadPolicy("album", " IMAGE/PNG ; charset=binary", 10),
      {
        folder: "album",
        contentType: "image/png",
        extension: "png",
      },
    );
  });

  it("rejects unknown folders", () => {
    assert.throws(
      () => getMediaUploadPolicy("../private", "image/jpeg", 10),
      (error: unknown) => error instanceof HttpError && error.statusCode === 400,
    );
  });

  it("rejects MIME types outside the selected folder policy", () => {
    for (const [folder, contentType] of [
      ["album", "audio/mpeg"],
      ["interact", "image/jpeg"],
      ["interact", "application/pdf"],
    ]) {
      assert.throws(
        () => getMediaUploadPolicy(folder, contentType, 10),
        (error: unknown) => error instanceof HttpError && error.statusCode === 415,
      );
    }
  });

  it("rejects empty or over-limit bodies and accepts the exact limit", () => {
    assert.throws(
      () => getMediaUploadPolicy("album", "image/jpeg", 0),
      (error: unknown) => error instanceof HttpError && error.statusCode === 400,
    );
    assert.throws(
      () => getMediaUploadPolicy("album", "image/jpeg", MAX_MEDIA_UPLOAD_BYTES + 1),
      (error: unknown) => error instanceof HttpError && error.statusCode === 413,
    );
    assert.equal(
      getMediaUploadPolicy("album", "image/jpeg", MAX_MEDIA_UPLOAD_BYTES).extension,
      "jpg",
    );
  });
});
