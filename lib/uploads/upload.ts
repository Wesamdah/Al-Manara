import { UploadApiResponse } from "cloudinary";
import { cloudinary } from "../cloudinary";
import { UploadError } from "./errors";
import { buildFolderPath, buildPublicId } from "./helpers";
import { validateFile, validateFilesCount } from "./schemas";

type UploadSingleInput = {
  file: File;
  folder: "brand-logo" | "car-image";
  carSlug?: string;
  index?: number;
};

export type UploadedAsset = {
  url: string;
  secureUrl: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
  bytes: number;
  originalFilename?: string;
  resourceType: string;
};

// Buffer : A Buffer is a Node.js class that represents a fixed-size chunk of memory.
// First : convert the file to an array buffer, ArrayBuffer is a generric, convert the file to bytes
// Then : convert the array buffer to a Buffer, which is what Cloudinary's upload method expects.

async function fileToBuffer(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function uploadBufferToCloudinary(params: {
  buffer: Buffer;
  folderPath: string;
  publicId: string;
  mimeType: string;
}): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: params.folderPath,
        public_id: params.publicId,
        overwrite: false,
        resource_type: "image",
        use_filename: false,
        unique_filename: true,
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }
        resolve(result);
      },
    );
    stream.end(params.buffer);
  });
}

export async function uploadSingleImage(
  input: UploadSingleInput,
): Promise<UploadedAsset> {
  const { file, folder, carSlug, index } = input;
  validateFile(file);

  if (folder === "car-image" && !carSlug) {
    throw new UploadError("carSlug is required for car images", 400);
  }

  const folderPath = buildFolderPath({
    folder,
    carSlug,
  });

  const publicId = buildPublicId({
    originalFileName: file.name,
    index,
  });

  //convert from Broswer file to buffer

  // Broswer file is a representation of a file in the browser, it has properties like name, size, type, etc.
  // but it is not directly usable for uploading to Cloudinary.
  // We need to convert it to a Buffer, which is a Node.js class that represents a fixed-size chunk of memory.
  // Cloudinary's upload method expects a Buffer for the file data, so we first convert the File to an ArrayBuffer (which is a generic, low-level representation of binary data)
  // then convert that ArrayBuffer to a Buffer that can be uploaded to Cloudinary.
  const buffer = await fileToBuffer(file);

  const result = await uploadBufferToCloudinary({
    buffer,
    folderPath,
    publicId,
    mimeType: file.type,
  });

  return {
    url: result.url,
    secureUrl: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
    originalFilename: result.original_filename,
    resourceType: result.resource_type,
  };
}

export async function uploadMultipleImages(input: {
  files: File[];
  folder: "brand-logo" | "car-image";
  carSlug?: string;
}) {
  validateFilesCount(input.files);

  for (const file of input.files) {
    validateFile(file);
  }

  const uploads = input.files.map((file, index) =>
    uploadSingleImage({
      file,
      folder: input.folder,
      carSlug: input.carSlug,
      index,
    }),
  );

  return Promise.all(uploads);
}
