import {
  MAX_UPLOAD_FILE_SIZE_BYTES,
  MAX_UPLOAD_FILES_PER_REQUEST,
  isAllowedUploadMimeType,
} from './upload.constants';

describe('upload limits', () => {
  it('allows files up to 5 GB per request', () => {
    expect(MAX_UPLOAD_FILE_SIZE_BYTES).toBe(5 * 1024 * 1024 * 1024);
    expect(MAX_UPLOAD_FILES_PER_REQUEST).toBe(10);
  });

  it('accepts image and video MIME types', () => {
    expect(isAllowedUploadMimeType('image/jpeg')).toBe(true);
    expect(isAllowedUploadMimeType('video/mp4')).toBe(true);
    expect(isAllowedUploadMimeType('application/pdf')).toBe(false);
  });
});
