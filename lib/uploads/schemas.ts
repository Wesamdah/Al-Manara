import { z } from "zod";

import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_FILES_PER_REQUEST,
  MAX_IMAGE_SIZE_BYTES,
} from "./constants";

import { UploadError } from "./errors";

export const uploadRequestSchema = z.object({
  folder: z.enum(["brand-logo", "car-image"]),
  carSlug: z.string().min(1).max(150).optional(),
});

export function validateFile(file: File) {
  if (!(file instanceof File)) {
    throw new UploadError("Invalid file", 400);
  }

  if (file.size <= 0) {
    throw new UploadError("Uploaded file is empty", 400);
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new UploadError("File is too large. Max size is 10MB", 400);
  }

  if (
    !ALLOWED_IMAGE_MIME_TYPES.includes(
      file.type as (typeof ALLOWED_IMAGE_MIME_TYPES)[number],
    )
  ) {
    throw new UploadError(
      "Invalid file type. Allowed: JPG, JPEG, PNG, WEBP",
      400,
    );
  }
}

export function validateFilesCount(files: File[]) {
  if (!files.length) {
    throw new UploadError("No files uploaded", 400);
  }

  if (files.length > MAX_FILES_PER_REQUEST) {
    throw new UploadError(
      `Too many files. Max allowed is ${MAX_FILES_PER_REQUEST}`,
      400,
    );
  }
}
