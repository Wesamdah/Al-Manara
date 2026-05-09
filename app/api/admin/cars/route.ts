import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  buildCarImageRecords,
  buildCarUploadSlug,
  isMultipartFormRequest,
  parseMultipartRequestPayload,
  uploadRequestFiles,
} from "@/lib/uploads/api";
import { carCreateInputSchema } from "@/lib/validations/database";
import { errorResponse, successResponse } from "@/lib/api/responses";
import { UploadError } from "@/lib/uploads/errors";

import { authenticateAndAuthorize } from "@/lib/auth/admin-auth";

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateAndAuthorize(request, ["admin"]);

    let rawBody: Record<string, unknown>;
    let imageRecords: ReturnType<typeof buildCarImageRecords> = [];

    if (!auth.success) {
      return NextResponse.json(
        { message: auth.message },
        { status: auth.status },
      );
    }

    if (isMultipartFormRequest(request)) {
      const { payload, files } =
        await parseMultipartRequestPayload<Record<string, unknown>>(request);

      const carSlug = buildCarUploadSlug({
        name: typeof payload.name === "string" ? payload.name : null,
        model: typeof payload.model === "string" ? payload.model : null,
        year: typeof payload.year === "number" ? payload.year : null,
      });

      const uploadedAssets = await uploadRequestFiles({
        files,
        folder: "car-image",
        carSlug,
      });

      const imageUrls = Array.isArray(payload.images)
        ? payload.images.filter(
            (image): image is string => typeof image === "string",
          )
        : undefined;

      imageRecords = buildCarImageRecords({
        imageUrls,
        uploadedAssets,
      });

      rawBody = {
        ...payload,
        images: imageRecords.map((image) => image.imageUrl),
      };
    } else {
      rawBody = (await request.json()) as Record<string, unknown>;
      imageRecords = buildCarImageRecords({
        imageUrls: Array.isArray(rawBody.images)
          ? rawBody.images.filter(
              (image): image is string => typeof image === "string",
            )
          : undefined,
      });
    }

    const bodyValidation = carCreateInputSchema.safeParse(rawBody);

    if (!bodyValidation.success) {
      return errorResponse(
        400,
        "Invalid request body",
        bodyValidation.error.flatten(),
      );
    }

    const {
      brandId,
      name,
      model,
      year,
      price,
      specifications,
      ...optionalValues
    } = bodyValidation.data;

    const car = await prisma.car.create({
      data: {
        brandId,
        name,
        model,
        year,
        price,
        ...optionalValues,

        images: imageRecords.length
          ? {
              create: imageRecords,
            }
          : undefined,

        specifications: specifications
          ? {
              create: {
                specs: specifications,
              },
            }
          : undefined,
      },
      include: {
        images: true,
        specifications: true,
        brand: true,
      },
    });
    return successResponse(201, car, "Car created successfully");
  } catch (error) {
    if (error instanceof UploadError) {
      return errorResponse(error.statusCode, error.message);
    }

    if (error instanceof SyntaxError) {
      return errorResponse(400, "Invalid JSON body");
    }

    console.error(error);
    return errorResponse(500, "Something went wrong");
  }
}
