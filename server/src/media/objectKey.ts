export function isAlbumObjectKeyOwnedByUser(userId: number, objectKey: string) {
  const ownerPrefix = `album/${userId}/`;

  if (!objectKey.startsWith(ownerPrefix)) {
    return false;
  }

  const suffixSegments = objectKey.slice(ownerPrefix.length).split("/");
  return suffixSegments.every(
    (segment) => segment !== "" && segment !== "." && segment !== "..",
  );
}
