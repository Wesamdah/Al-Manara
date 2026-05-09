import { authenticateAndAuthorize } from "@/lib/auth/admin-auth";
import { prisma } from "@/lib/prisma";
import {
  buildCarAvailableMessage,
  buildWhatsAppLink,
} from "@/lib/whatsapp-link";
import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateAndAuthorize(request, ["admin"]);

    if (!auth.success) {
      return NextResponse.json(
        { message: auth.message },
        { status: auth.status },
      );
    }

    const { searchParams } = new URL(request.url);
    const carId = searchParams.get("carId");
    const notified = searchParams.get("notified");

    const interests = await prisma.carInterest.findMany({
      where: {
        // to filter about the values of carId and notified only if they are provided in the query parameters
        // dont but the keys if the values are not provided
        ...(carId && { carId }),
        ...(notified === "true" && { notified: true }),
        ...(notified === "false" && { notified: false }),
      },
      orderBy: {
        createdAt: "desc", // Newest first
      },
      select: {
        id: true,
        carId: true,
        email: true,
        phoneNumber: true,
        notified: true,
        createdAt: true,
        car: {
          select: {
            id: true,
            name: true,
            model: true,
            year: true,
            stockQuantity: true,
            price: true,
            brand: {
              select: {
                name: true,
              },
            },
            images: {
              where: {
                isPrimary: true,
              },
              select: {
                imageUrl: true,
              },
              take: 1,
            },
          },
        },
      },
    });

    return NextResponse.json(
      {
        status: 200,
        data: interests,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching interests:", error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
