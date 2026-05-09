import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { visitorEventCreateInputSchema } from "@/lib/validations/database";

// this function is used to get the client's IP address from the request headers
function getClientIp(request: NextRequest) {
  const forWardeFor = request.headers.get("x-forwarded-for"); // Check for the X-Forwarded-For header first
  // X-Forwarded-For header can contain multiple IPs, the first one is the client's IP

  if (forWardeFor) {
    return forWardeFor.split(",")[0].trim(); // Return the first IP in the list
    // this IP is the client's IP address, even if the request is coming through a proxy or load balancer
  }

  const realIp = request.headers.get("x-real-ip"); // Check for the X-Real-IP header as a fallback

  if (realIp) {
    return realIp; // Return the IP from X-Real-IP header if available
  }

  return "0.0.0.0"; // Fallback to a default IP if neither header is present
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const bodyValidation = visitorEventCreateInputSchema.safeParse(body);

    if (!bodyValidation.success) {
      return NextResponse.json(
        {
          message: "Invalid request body",
          issues: bodyValidation.error.flatten(),
        },
        { status: 400 },
      );
    }

    const data = bodyValidation.data;

    if (data.carId) {
      const car = await prisma.car.findUnique({
        where: {
          id: data.carId,
        },
        select: {
          id: true,
        },
      });

      if (!car) {
        return NextResponse.json({ message: "Car not found" }, { status: 404 });
      }
    }

    const event = await prisma.visitorEvent.create({
      data: {
        eventType: data.eventType,
        page: data.page,
        carId: data.carId ?? null,
        ipAddress: getClientIp(request),
        userAgent: request.headers.get("user-agent"),
      },
      select: {
        id: true,
        eventType: true,
        page: true,
        carId: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        status: 201,
        data: event,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating visitor event:", error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
