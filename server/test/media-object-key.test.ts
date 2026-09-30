import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isAlbumObjectKeyOwnedByUser } from "../src/media/objectKey.js";

describe("album object key ownership", () => {
  it("accepts keys under the exact user's album prefix", () => {
    assert.equal(isAlbumObjectKeyOwnedByUser(17, "album/17/story/photo.jpg"), true);
  });

  it("rejects other folders, other users, and user IDs outside the owner prefix", () => {
    for (const objectKey of [
      "album/18/photo.jpg",
      "album/170/photo.jpg",
      "interact/17/voice.webm",
      "other/18/17/photo.jpg",
    ]) {
      assert.equal(isAlbumObjectKeyOwnedByUser(17, objectKey), false, objectKey);
    }
  });

  it("rejects empty and dot-navigation suffix path segments", () => {
    for (const objectKey of [
      "album/17/../18/photo.jpg",
      "album/17/./photo.jpg",
      "album/17//photo.jpg",
      "album/17/",
    ]) {
      assert.equal(isAlbumObjectKeyOwnedByUser(17, objectKey), false, objectKey);
    }
  });
});
