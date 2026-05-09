import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api/responses";
import type { NextRequest } from "next/server";

type CarRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: NextRequest, context: CarRouteContext) {
  try {
    const { id } = await context.params;

    const car = await prisma.car.findUnique({
      where: {
        id,
      },
      include: {
        brand: true,
        images: true,
        specifications: true,
      },
    });

    if (!car) {
      return errorResponse(404, "Car not found");
    }

    return successResponse(200, car);
  } catch {
    return errorResponse(500, "Internal Server Error");
  }
}
