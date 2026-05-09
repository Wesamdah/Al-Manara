import { NextRequest } from "next/server";
import { uploadRequestSchema } from "@/lib/uploads/schemas";
import { uploadMultipleImages, uploadSingleImage } from "@/lib/uploads/upload";
import { UploadError } from "@/lib/uploads/errors";
import { errorResponse, successResponse } from "@/lib/api/responses";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const folderValue = formData.get("folder");
    const carSlugValue = formData.get("carSlug");
    const files = formData
      .getAll("files")
      .filter((item) => item instanceof File) as File[];

    const parsed = uploadRequestSchema.safeParse({
      folder: folderValue,
      carSlug: typeof carSlugValue === "string" ? carSlugValue : undefined,
    });

    if (!parsed.success) {
      return errorResponse(
        400,
        "Invalid upload payload",
        parsed.error.flatten(),
      );
    }

    const { folder, carSlug } = parsed.data;

    if (folder === "brand-logo" && files.length !== 1) {
      return errorResponse(400, "Brand logo upload requires exactly one file");
    }

    if (folder === "car-image" && !carSlug) {
      return errorResponse(400, "carSlug is required for car-image uploads");
    }

    if (!files.length) {
      return errorResponse(400, "No files uploaded");
    }

    if (files.length === 1) {
      const uploaded = await uploadSingleImage({
        file: files[0],
        folder,
        carSlug,
      });

      return successResponse(201, uploaded, "Upload successful");
    }

    const uploaded = await uploadMultipleImages({
      files,
      folder,
      carSlug,
    });

    return successResponse(201, uploaded, "Multiple upload successful");
  } catch (error) {
    if (error instanceof UploadError) {
      return errorResponse(error.statusCode, error.message);
    }
    console.error("Upload route error:", error);

    return errorResponse(500, "Internal Server Error");
  }
}
