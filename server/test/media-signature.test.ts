import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { HttpError } from "../src/errors.js";
import { assertMediaSignatureMatches } from "../src/media/mediaSignature.js";
import { getMediaUploadPolicy } from "../src/media/uploadPolicy.js";

function isoBmff(brand: string, compatibleBrands: string[] = []) {
  const boxSize = 16 + compatibleBrands.length * 4;
  const body = Buffer.alloc(boxSize);
  body.writeUInt32BE(boxSize, 0);
  body.write("ftyp", 4, "ascii");
  body.write(brand, 8, "ascii");
  for (let index = 0; index < compatibleBrands.length; index += 1) {
    body.write(compatibleBrands[index], 16 + index * 4, "ascii");
  }
  return body;
}

function extendedIsoBmff(brand: string) {
  const body = Buffer.alloc(24);
  body.writeUInt32BE(1, 0);
  body.write("ftyp", 4, "ascii");
  body.writeBigUInt64BE(BigInt(body.length), 8);
  body.write(brand, 16, "ascii");
  return body;
}

function oversizedIsoBmffFtyp() {
  const body = Buffer.alloc(4100);
  body.writeUInt32BE(body.length, 0);
  body.write("ftyp", 4, "ascii");
  body.write("isom", 8, "ascii");
  return body;
}

function oversizedEbmlHeader() {
  const body = Buffer.alloc(4103);
  Buffer.from("1a45dfa3", "hex").copy(body);
  body[4] = 0x50;
  body[5] = 0x01;
  return body;
}

function pngHeader() {
  const body = Buffer.alloc(33);
  Buffer.from("89504e470d0a1a0a", "hex").copy(body);
  body.writeUInt32BE(13, 8);
  body.write("IHDR", 12, "ascii");
  body.writeUInt32BE(1, 16);
  body.writeUInt32BE(1, 20);
  body[24] = 8;
  body[25] = 2;
  return body;
}

function bitmapHeader() {
  const body = Buffer.alloc(54);
  body.write("BM", 0, "ascii");
  body.writeUInt32LE(body.length, 2);
  body.writeUInt32LE(54, 10);
  body.writeUInt32LE(40, 14);
  body.writeInt32LE(1, 18);
  body.writeInt32LE(1, 22);
  body.writeUInt16LE(1, 26);
  body.writeUInt16LE(24, 28);
  return body;
}

function webpHeader() {
  const body = Buffer.alloc(30);
  body.write("RIFF", 0, "ascii");
  body.writeUInt32LE(22, 4);
  body.write("WEBP", 8, "ascii");
  body.write("VP8X", 12, "ascii");
  body.writeUInt32LE(10, 16);
  return body;
}

function waveHeader() {
  const body = Buffer.alloc(36);
  body.write("RIFF", 0, "ascii");
  body.writeUInt32LE(28, 4);
  body.write("WAVE", 8, "ascii");
  body.write("fmt ", 12, "ascii");
  body.writeUInt32LE(16, 16);
  return body;
}

function ebmlHeader(docType: string) {
  const docTypeBytes = Buffer.from(docType, "ascii");
  const headerSize = 3 + docTypeBytes.length;
  const headerSizeVint = 0x80 | headerSize;
  return Buffer.concat([
    Buffer.from([0x1a, 0x45, 0xdf, 0xa3, headerSizeVint, 0x42, 0x82]),
    Buffer.from([0x80 | docTypeBytes.length]),
    docTypeBytes,
  ]);
}

const webm = ebmlHeader("webm");

const supportedHeaders: [string, string, Buffer][] = [
  ["album", "image/avif", isoBmff("avif")],
  ["album", "image/bmp", bitmapHeader()],
  ["album", "image/gif", Buffer.from("GIF89a0000000", "ascii")],
  ["album", "image/heic", isoBmff("heic")],
  ["album", "image/heif", isoBmff("mif1")],
  ["album", "image/jpeg", Buffer.from("ffd8ffe0", "hex")],
  ["album", "image/png", pngHeader()],
  ["album", "image/webp", webpHeader()],
  ["album", "video/3gpp", isoBmff("3gp6")],
  ["album", "video/3gpp2", isoBmff("3g2a")],
  ["album", "video/mp4", isoBmff("isom")],
  ["album", "video/quicktime", isoBmff("qt  ")],
  ["album", "video/webm", webm],
  ["album", "video/x-m4v", isoBmff("M4V ")],
  ["interact", "audio/aac", Buffer.from("fff150800000fc", "hex")],
  ["interact", "audio/mp4", isoBmff("M4A ")],
  ["interact", "audio/mpeg", Buffer.from("49443304000000000000", "hex")],
  ["interact", "audio/ogg", Buffer.from(`OggS${"\0".repeat(23)}`, "ascii")],
  ["interact", "audio/wav", waveHeader()],
  ["interact", "audio/webm;codecs=opus", webm],
  ["interact", "audio/wave", waveHeader()],
  ["interact", "audio/x-aac", Buffer.from("fff150800000fc", "hex")],
  ["interact", "audio/x-m4a", isoBmff("M4A ")],
  ["interact", "audio/x-wav", waveHeader()],
];

describe("media signature validation", () => {
  it("accepts recognizable headers for every MIME type in the current allowlist", () => {
    assert.equal(supportedHeaders.length, 24);

    for (const [folder, contentType, body] of supportedHeaders) {
      const policy = getMediaUploadPolicy(folder, contentType, body.length);
      assert.doesNotThrow(
        () => assertMediaSignatureMatches(policy.contentType, body),
        `${contentType} should accept its recognized header`,
      );
    }
  });

  it("accepts compatible brands in extended ISO-BMFF file type boxes", () => {
    assert.doesNotThrow(() =>
      assertMediaSignatureMatches("video/mp4", extendedIsoBmff("isom")),
    );
  });

  it("rejects mismatched, truncated, unknown, or non-WebM container headers", () => {
    const malformedWebp = Buffer.from("524946460000000057454250", "hex");
    const malformedIsoBmff = Buffer.from(
      "00000020 66747970 69736f6d 00000000".replaceAll(" ", ""),
      "hex",
    );
    const cases: [string, string, Buffer][] = [
      ["album", "image/png", Buffer.from("ffd8ffe0", "hex")],
      ["interact", "audio/wav", webpHeader()],
      ["album", "video/mp4", isoBmff("avif")],
      ["interact", "audio/webm", ebmlHeader("matroska")],
      ["album", "image/webp", malformedWebp],
      ["album", "video/mp4", malformedIsoBmff],
      ["album", "video/mp4", oversizedIsoBmffFtyp()],
      ["album", "video/webm", oversizedEbmlHeader()],
      ["album", "image/png", Buffer.from("89504e470d0a1a0a", "hex")],
      ["album", "image/gif", Buffer.from("GIF89a", "ascii")],
      ["interact", "audio/ogg", Buffer.from("OggS", "ascii")],
      ["album", "image/jpeg", Buffer.from("not an image", "ascii")],
    ];

    for (const [folder, contentType, body] of cases) {
      const policy = getMediaUploadPolicy(folder, contentType, body.length);
      assert.throws(
        () => assertMediaSignatureMatches(policy.contentType, body),
        (error: unknown) =>
          error instanceof HttpError && error.statusCode === 415,
        `${contentType} should reject an unrecognized or mismatched header`,
      );
    }
  });
});
