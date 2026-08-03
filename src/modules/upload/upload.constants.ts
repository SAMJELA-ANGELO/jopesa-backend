export const MAX_UPLOAD_FILE_SIZE_BYTES = 5 * 1024 * 1024 * 1024;
export const MAX_UPLOAD_FILES_PER_REQUEST = 10;

export const isAllowedUploadMimeType = (mimeType?: string) => {
  if (!mimeType) return false;
  return mimeType.startsWith('image/') || mimeType.startsWith('video/');
};
