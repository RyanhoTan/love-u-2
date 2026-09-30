import { HttpError } from "../errors.js";

const MAX_ISO_BMFF_FTYP_BYTES = 4 * 1024;
const MAX_EBML_HEADER_BYTES = 4 * 1024;
const MAX_WAVE_HEADER_CHUNKS = 4096;
const SUPPORTED_BMP_DIB_HEADER_SIZES = new Set([12, 40, 52, 56, 64, 108, 124]);
const MIN_WEBP_CHUNK_SIZES: Record<string, number> = {
  "VP8 ": 10,
  VP8L: 5,
  VP8X: 10,
};

function hasAsciiAt(body: Buffer, offset: number, value: string) {
  return (
    offset >= 0 &&
    offset + value.length <= body.length &&
    body.toString("ascii", offset, offset + value.length) === value
  );
}

function getIsoBmffBrands(body: Buffer): Set<string> | null {
  if (body.length < 16 || !hasAsciiAt(body, 4, "ftyp")) {
    return null;
  }

  const declaredSize = body.readUInt32BE(0);
  let boxSize: number;
  let majorBrandOffset: number;
  let compatibleBrandOffset: number;

  if (declaredSize === 1) {
    if (body.length < 24) {
      return null;
    }

    const largeSize = body.readBigUInt64BE(8);
    if (largeSize > BigInt(body.length)) {
      return null;
    }

    boxSize = Number(largeSize);
    majorBrandOffset = 16;
    compatibleBrandOffset = 24;
  } else {
    boxSize = declaredSize === 0 ? body.length : declaredSize;
    majorBrandOffset = 8;
    compatibleBrandOffset = 16;
  }

  if (
    boxSize < compatibleBrandOffset ||
    boxSize > body.length ||
    boxSize > MAX_ISO_BMFF_FTYP_BYTES ||
    (boxSize - compatibleBrandOffset) % 4 !== 0
  ) {
    return null;
  }

  const brands = new Set<string>([
    body.toString("ascii", majorBrandOffset, majorBrandOffset + 4),
  ]);

  for (
    let offset = compatibleBrandOffset;
    offset + 4 <= boxSize;
    offset += 4
  ) {
    brands.add(body.toString("ascii", offset, offset + 4));
  }

  return brands;
}

type Vint = { length: number; value: bigint };

function readVint(
  body: Buffer,
  offset: number,
  keepMarker: boolean,
  maxLength: number,
): Vint | null {
  if (offset < 0 || offset >= body.length) {
    return null;
  }

  const firstByte = body[offset];
  let marker = 0x80;
  let length = 1;

  while ((firstByte & marker) === 0 && length <= maxLength) {
    marker >>= 1;
    length += 1;
  }

  if (length > maxLength || offset + length > body.length || marker === 0) {
    return null;
  }

  let value = BigInt(keepMarker ? firstByte : firstByte & (marker - 1));
  for (let index = 1; index < length; index += 1) {
    value = (value << 8n) | BigInt(body[offset + index]);
  }

  return { length, value };
}

function isWebmContainer(body: Buffer) {
  if (body.length < 8 || !body.subarray(0, 4).equals(Buffer.from("1a45dfa3", "hex"))) {
    return false;
  }

  const headerSize = readVint(body, 4, false, 8);
  if (
    !headerSize ||
    headerSize.value > BigInt(body.length) ||
    headerSize.value > BigInt(MAX_EBML_HEADER_BYTES)
  ) {
    return false;
  }

  const headerPayloadStart = 4 + headerSize.length;
  const headerEnd = headerPayloadStart + Number(headerSize.value);
  if (headerEnd > body.length) {
    return false;
  }

  let offset = headerPayloadStart;
  while (offset < headerEnd) {
    const elementId = readVint(body, offset, true, 4);
    if (!elementId) {
      return false;
    }

    const sizeOffset = offset + elementId.length;
    const elementSize = readVint(body, sizeOffset, false, 8);
    if (!elementSize) {
      return false;
    }

    const payloadStart = sizeOffset + elementSize.length;
    const payloadEnd = payloadStart + Number(elementSize.value);
    if (payloadEnd > headerEnd) {
      return false;
    }

    if (elementId.value === 0x4282n) {
      return body.toString("ascii", payloadStart, payloadEnd) === "webm";
    }

    offset = payloadEnd;
  }

  return false;
}

function hasPngHeader(body: Buffer) {
  return (
    body.length >= 33 &&
    body.subarray(0, 8).equals(Buffer.from("89504e470d0a1a0a", "hex")) &&
    body.readUInt32BE(8) === 13 &&
    hasAsciiAt(body, 12, "IHDR")
  );
}

function hasWebpHeader(body: Buffer) {
  if (
    body.length < 20 ||
    !hasAsciiAt(body, 0, "RIFF") ||
    !hasAsciiAt(body, 8, "WEBP")
  ) {
    return false;
  }

  const riffSize = body.readUInt32LE(4);
  const chunkSize = body.readUInt32LE(16);
  const riffEnd = riffSize + 8;
  const chunkType = body.toString("ascii", 12, 16);
  const minimumChunkSize = MIN_WEBP_CHUNK_SIZES[chunkType];

  return (
    minimumChunkSize !== undefined &&
    riffSize >= 12 &&
    riffEnd <= body.length &&
    chunkSize >= minimumChunkSize &&
    chunkSize <= riffSize - 12 &&
    20 + minimumChunkSize <= riffEnd
  );
}

function hasRiffWaveHeader(body: Buffer) {
  if (
    body.length < 12 ||
    !hasAsciiAt(body, 0, "RIFF") ||
    !hasAsciiAt(body, 8, "WAVE")
  ) {
    return false;
  }

  const riffSize = body.readUInt32LE(4);
  const riffEnd = riffSize + 8;
  if (riffSize < 4 || riffEnd > body.length) {
    return false;
  }

  let offset = 12;
  let chunkCount = 0;
  while (
    offset + 8 <= riffEnd &&
    chunkCount < MAX_WAVE_HEADER_CHUNKS
  ) {
    chunkCount += 1;
    const chunkSize = body.readUInt32LE(offset + 4);
    const chunkEnd = offset + 8 + chunkSize;
    if (chunkEnd > riffEnd) {
      return false;
    }

    if (hasAsciiAt(body, offset, "fmt ")) {
      return chunkSize >= 16;
    }

    offset = chunkEnd + (chunkSize % 2);
  }

  return false;
}

function hasBitmapHeader(body: Buffer) {
  if (body.length < 26 || !hasAsciiAt(body, 0, "BM")) {
    return false;
  }

  const fileSize = body.readUInt32LE(2);
  const pixelDataOffset = body.readUInt32LE(10);
  const dibHeaderSize = body.readUInt32LE(14);

  return (
    fileSize >= 14 + dibHeaderSize &&
    fileSize <= body.length &&
    SUPPORTED_BMP_DIB_HEADER_SIZES.has(dibHeaderSize) &&
    pixelDataOffset >= 14 + dibHeaderSize &&
    pixelDataOffset <= fileSize
  );
}

function hasMpegAudioHeader(body: Buffer) {
  if (hasAsciiAt(body, 0, "ID3")) {
    return body.length >= 10;
  }

  if (body.length < 4 || body[0] !== 0xff || (body[1] & 0xe0) !== 0xe0) {
    return false;
  }

  const version = (body[1] >> 3) & 0x03;
  const layer = (body[1] >> 1) & 0x03;
  return version !== 0x01 && layer !== 0;
}

function hasAacHeader(body: Buffer) {
  return (
    body.length >= 7 &&
    (hasAsciiAt(body, 0, "ADIF") ||
      (body[0] === 0xff && (body[1] & 0xf6) === 0xf0))
  );
}

function hasIsoBmffBrand(body: Buffer, acceptedBrands: readonly string[]) {
  const brands = getIsoBmffBrands(body);
  return Boolean(brands && acceptedBrands.some((brand) => brands.has(brand)));
}

function hasIsoBmffPrefix(body: Buffer, prefix: string) {
  const brands = getIsoBmffBrands(body);
  return Boolean(brands && [...brands].some((brand) => brand.startsWith(prefix)));
}

function signatureMatches(contentType: string, body: Buffer) {
  switch (contentType) {
    case "image/avif":
      return hasIsoBmffBrand(body, ["avif", "avis"]);
    case "image/bmp":
      return hasBitmapHeader(body);
    case "image/gif":
      return (
        body.length >= 13 &&
        (hasAsciiAt(body, 0, "GIF87a") || hasAsciiAt(body, 0, "GIF89a"))
      );
    case "image/heic":
      return hasIsoBmffBrand(body, ["heic", "heix", "hevc", "hevx"]);
    case "image/heif":
      return hasIsoBmffBrand(body, ["mif1", "msf1"]);
    case "image/jpeg":
      return body.length >= 3 && body[0] === 0xff && body[1] === 0xd8 && body[2] === 0xff;
    case "image/png":
      return hasPngHeader(body);
    case "image/webp":
      return hasWebpHeader(body);
    case "video/3gpp":
      return hasIsoBmffPrefix(body, "3gp");
    case "video/3gpp2":
      return hasIsoBmffPrefix(body, "3g2");
    case "video/mp4":
      return hasIsoBmffBrand(body, [
        "isom",
        "iso2",
        "iso3",
        "iso4",
        "iso5",
        "iso6",
        "iso8",
        "mp41",
        "mp42",
        "avc1",
        "dash",
        "F4V ",
        "M4V ",
        "MSNV",
      ]);
    case "video/quicktime":
      return hasIsoBmffBrand(body, ["qt  "]);
    case "video/webm":
    case "audio/webm":
      return isWebmContainer(body);
    case "video/x-m4v":
      return hasIsoBmffBrand(body, ["M4V ", "M4VH", "M4VP"]);
    case "audio/aac":
    case "audio/x-aac":
      return hasAacHeader(body);
    case "audio/mp4":
    case "audio/x-m4a":
      // Generic ISO-BMFF brands are shared by audio/video MP4; this checks
      // the container family, not the presence or absence of codec tracks.
      return hasIsoBmffBrand(body, [
        "M4A ",
        "M4B ",
        "M4P ",
        "mp4a",
        "isom",
        "iso2",
        "mp41",
        "mp42",
      ]);
    case "audio/mpeg":
      return hasMpegAudioHeader(body);
    case "audio/ogg":
      return body.length >= 27 && hasAsciiAt(body, 0, "OggS") && body[4] === 0;
    case "audio/wav":
    case "audio/wave":
    case "audio/x-wav":
      return hasRiffWaveHeader(body);
    default:
      return false;
  }
}

export function assertMediaSignatureMatches(contentType: string, body: Buffer) {
  if (!signatureMatches(contentType, body)) {
    throw new HttpError(415, "media content does not match declared media type");
  }
}
