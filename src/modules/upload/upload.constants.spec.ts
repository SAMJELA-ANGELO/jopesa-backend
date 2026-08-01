import {
  MAX_UPLOAD_FILE_SIZE_BYTES,
  MAX_UPLOAD_FILES_PER_REQUEST,
} from './upload.constants';

describe('upload limits', () => {
  it('allows files up to 5 GB per request', () => {
    expect(MAX_UPLOAD_FILE_SIZE_BYTES).toBe(5 * 1024 * 1024 * 1024);
    expect(MAX_UPLOAD_FILES_PER_REQUEST).toBe(10);
  });
});
