export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
] as const;

export const UPLOAD_FOLDERS = {
  BRAND_LOGO: "brand-logo",
  CAR_IMAGE: "car-image",
} as const;

export type UploadFolder = (typeof UPLOAD_FOLDERS)[keyof typeof UPLOAD_FOLDERS];
// Type T = "brand-logo" | "car-image"

export const MAX_FILES_PER_REQUEST = 20;
