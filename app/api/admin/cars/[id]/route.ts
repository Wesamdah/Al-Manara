import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  buildCarImageRecords,
  buildCarUploadSlug,
  isMultipartFormRequest,
  parseMultipartRequestPayload,
  uploadRequestFiles,
} from "@/lib/uploads/api";
import { errorResponse, successResponse } from "@/lib/api/responses";
import { carCreateInputSchema } from "@/lib/validations/database";
import { UploadError } from "@/lib/uploads/errors";

import { authenticateAndAuthorize } from "@/lib/auth/admin-auth";

type AdminCarRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  request: NextRequest,
  context: AdminCarRouteContext,
) {
  try {
    const auth = await authenticateAndAuthorize(request, ["admin"]);

    let rawBody: Record<string, unknown>;
    let imageRecords: ReturnType<typeof buildCarImageRecords> | undefined;

    if (!auth.success) {
      return NextResponse.json(
        { message: auth.message },
        { status: auth.status },
      );
    }

    const { id } = await context.params;

    if (isMultipartFormRequest(request)) {
      const { payload, files } =
        await parseMultipartRequestPayload<Record<string, unknown>>(request);

      const currentCar = await prisma.car.findUnique({
        where: { id },
        select: { name: true, model: true, year: true },
      });

      if (!currentCar) {
        return errorResponse(404, "Car not found");
      }

      const carSlug = buildCarUploadSlug({
        name: typeof payload.name === "string" ? payload.name : currentCar.name,
        model:
          typeof payload.model === "string" ? payload.model : currentCar.model,
        year: typeof payload.year === "number" ? payload.year : currentCar.year,
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

      imageRecords =
        uploadedAssets.length || imageUrls
          ? buildCarImageRecords({ imageUrls, uploadedAssets })
          : undefined;

      rawBody = {
        ...payload,
        ...(imageRecords
          ? { images: imageRecords.map((image) => image.imageUrl) }
          : {}),
      };
    } else {
      rawBody = (await request.json()) as Record<string, unknown>;
      imageRecords = Array.isArray(rawBody.images)
        ? buildCarImageRecords({
            imageUrls: rawBody.images.filter(
              (image): image is string => typeof image === "string",
            ),
          })
        : undefined;
    }

    const updateCarSchema = carCreateInputSchema.partial();
    const bodyValidation = updateCarSchema.safeParse(rawBody);

    if (!bodyValidation.success) {
      return errorResponse(
        400,
        "Invalid request body",
        bodyValidation.error.flatten(),
      );
    }

    const data = bodyValidation.data;

    const updatedCar = await prisma.car.update({
      where: {
        id,
      },
      data: {
        ...data,
        images: imageRecords
          ? {
              deleteMany: {}, // Delete existing images
              create: imageRecords,
            }
          : undefined,
        specifications: data.specifications
          ? {
              deleteMany: {}, // Delete existing specifications
              create: {
                specs: data.specifications,
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
    return successResponse(200, updatedCar, "Car updated successfully");
  } catch (error) {
    if (error instanceof UploadError) {
      return errorResponse(error.statusCode, error.message);
    }

    if (error instanceof SyntaxError) {
      return errorResponse(400, "Invalid JSON body");
    }

    return errorResponse(500, "Internal Server Error");
  }
}

export async function DELETE(
  _request: NextRequest,
  context: AdminCarRouteContext,
) {
  try {
    const { id } = await context.params;

    await prisma.car.delete({
      where: {
        id,
      },
    });
    return successResponse(200, null, "Car deleted successfully");
  } catch (error) {
    console.error("Error deleting car:", error);
    return errorResponse(500, "Internal Server Error");
  }
}
