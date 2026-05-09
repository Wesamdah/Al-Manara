import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api/responses";
import { UploadError } from "@/lib/uploads/errors";
import {
  isMultipartFormRequest,
  parseMultipartRequestPayload,
  uploadRequestFiles,
} from "@/lib/uploads/api";
import { brandCreateInputSchema } from "@/lib/validations/database";
import { NextRequest } from "next/server";
import { authenticateAndAuthorize } from "@/lib/auth/admin-auth";
import { da } from "zod/locales";

export async function GET() {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: {
        name: "asc", // Order brands alphabetically by name
      },
    });

    if (brands.length === 0) {
      return errorResponse(404, "No brands found");
    }

    return successResponse(200, brands);
  } catch {
    return errorResponse(500, "Internal Server Error");
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateAndAuthorize(request, ["admin"]);

    if (!auth.success) {
      return errorResponse(auth.status, auth.message ?? "Unauthorized");
    }

    let rawBody: unknown;
    let logoPublicId: string | null = null;

    if (isMultipartFormRequest(request)) {
      const { payload, files } =
        await parseMultipartRequestPayload<Record<string, unknown>>(request);

      if (files.length > 1) {
        return errorResponse(
          400,
          "Brand logo upload requires exactly one file",
        );
      }

      const [uploadedLogo] = await uploadRequestFiles({
        files,
        folder: "brand-logo",
      });

      rawBody = {
        ...payload,
        logoUrl:
          uploadedLogo?.secureUrl ??
          (typeof payload.logoUrl === "string" ? payload.logoUrl : null),
      };
      logoPublicId = uploadedLogo?.publicId ?? null;
    } else {
      rawBody = await request.json();
    }

    const bodyValidation = brandCreateInputSchema.safeParse(rawBody);

    if (!bodyValidation.success) {
      return errorResponse(
        400,
        "Invalid request body",
        bodyValidation.error.flatten(),
      );
    }

    const data = bodyValidation.data;

    const excistingBrand = await prisma.brand.findFirst({
      where: {
        OR: [{ name: data.name }, { slug: data.slug }],
      },
    });

    if (excistingBrand) {
      return errorResponse(
        409,
        "A brand with the same name or slug already exists",
      );
    }

    const brand = await prisma.brand.create({
      data: {
        name: data.name,
        slug: data.slug,
        country: data.country,
        logoUrl: data.logoUrl,
        logoPublicId,
      },
    });

    return successResponse(201, brand, "Brand created successfully");
  } catch (error) {
    if (error instanceof UploadError) {
      return errorResponse(error.statusCode, error.message);
    }

    if (error instanceof SyntaxError) {
      return errorResponse(400, "Invalid JSON body");
    }

    console.error("Error creating brand:", error);
    return errorResponse(500, "Internal Server Error");
  }
}
