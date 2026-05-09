import { NextRequest } from "next/server";

import { UploadFolder } from "./constants";
import { UploadError } from "./errors";
import { slugify } from "./helpers";
import {
  UploadedAsset,
  uploadMultipleImages,
  uploadSingleImage,
} from "./upload";

// Form Data field names
const PAYLOAD_FIELD = "payload"; // payload should be a JSON string containing any additional data needed for the upload (e.g. car details)
const FILES_FIELD = "files";

export function isMultipartFormRequest(request: NextRequest) {
  return request.headers.get("content-type")?.includes("multipart/form-data");
}

// Read the request from the multipart form data, extract the JSON payload and the files
// and return them in a structured format
export async function parseMultipartRequestPayload<T extends object>(
  request: NextRequest,
): Promise<{
  payload: T;
  files: File[];
}> {
  const formData = await request.formData();
  const payloadEntry = formData.get(PAYLOAD_FIELD);

  if (typeof payloadEntry !== "string") {
    throw new UploadError(`"${PAYLOAD_FIELD}" must be a JSON string`, 400);
  }

  let payload: T;

  try {
    payload = JSON.parse(payloadEntry) as T;
  } catch {
    throw new UploadError(`"${PAYLOAD_FIELD}" must contain valid JSON`, 400);
  }

  const files = formData
    .getAll(FILES_FIELD)
    .filter((item): item is File => item instanceof File);

  return { payload, files };
}

// this wrapper function handles the logic of uploading one or multiple files based on the number of files provided in the request
export async function uploadRequestFiles(params: {
  files: File[];
  folder: UploadFolder;
  carSlug?: string;
}) {
  const { files, folder, carSlug } = params;

  if (!files.length) {
    return [];
  }

  if (files.length === 1) {
    return [await uploadSingleImage({ file: files[0], folder, carSlug })];
  }

  return uploadMultipleImages({ files, folder, carSlug });
}

export function buildCarUploadSlug(params: {
  name?: string | null;
  model?: string | null;
  year?: number | null;
}) {
  const slug = slugify(
    [params.name, params.model, params.year]
      .filter(
        (value): value is string | number =>
          value !== null && value !== undefined,
      )
      .join("-"),
  );

  if (!slug) {
    throw new UploadError(
      "Car name, model, and year are required to upload car images",
      400,
    );
  }

  return slug;
}

export function buildCarImageRecords(params: {
  imageUrls?: string[];
  uploadedAssets?: UploadedAsset[];
}) {
  const assetRecords = (params.uploadedAssets ?? []).map((asset) => ({
    imageUrl: asset.secureUrl,
    publicId: asset.publicId,
  }));

  // If there are Image URLs does not upload to cloudinary so we use the URL as the publicId as well since we don't have a separate publicId for externally hosted images.
  // This allows us to keep track of these images in the same way as uploaded assets.
  const urlRecords = (params.imageUrls ?? []).map((imageUrl) => ({
    imageUrl,
    publicId: imageUrl,
  }));

  return [...assetRecords, ...urlRecords].map((image, index) => ({
    ...image,
    isPrimary: index === 0,
  }));
}
