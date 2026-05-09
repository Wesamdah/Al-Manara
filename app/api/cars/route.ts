import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api/responses";
import { carQuerySchema } from "@/lib/validations/database";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const queryValidation = carQuerySchema.safeParse(
    Object.fromEntries(searchParams.entries()),
  );

  if (!queryValidation.success) {
    return errorResponse(
      400,
      "Invalid query parameters",
      queryValidation.error.flatten(),
    );
  }

  const { name, brand, minPrice, maxPrice, year } = queryValidation.data;

  try {
    const cars = await prisma.car.findMany({
      where: {
        isActive: true,
        name: name ? { contains: name, mode: "insensitive" } : undefined,
        brand: brand ? { slug: brand } : undefined,
        price: {
          gte: minPrice, //gte: minPrice ? new Prisma.Decimal(minPrice) : undefined,
          lte: maxPrice, //lte: maxPrice ? new Prisma.Decimal(maxPrice) : undefined,
        },
        year,
      },
      include: {
        brand: true,
        images: true,
      },
      orderBy: {
        createdAt: "desc", // Order by creation date, newest first
      },
    });
    return successResponse(200, cars);
  } catch (error) {
    console.error("Error fetching cars:", error);
    return errorResponse(500, "Internal Server Error");
  }
}
