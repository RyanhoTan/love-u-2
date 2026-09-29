export function isAlbumObjectKeyOwnedByUser(userId: number, objectKey: string) {
  return objectKey.startsWith(`album/${userId}/`);
}
