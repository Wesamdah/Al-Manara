import { prisma } from "@/lib/prisma";
import { carInterestCreateInputSchema } from "@/lib/validations/database";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = carInterestCreateInputSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          message: "Invalid request body",
          issues: validation.error.flatten(),
        },
        { status: 400 },
      );
    }

    const data = validation.data;

    const car = await prisma.car.findUnique({
      where: { id: data.carId },
      select: {
        id: true,
        isActive: true,
        stockQuantity: true,
      },
    });

    if (!car || !car.isActive) {
      return NextResponse.json({ message: "Car not found" }, { status: 404 });
    }

    if (car.stockQuantity > 0) {
      return NextResponse.json(
        {
          message:
            "This car is currently available. No need to register interest.",
        },
        { status: 400 },
      );
    }

    const interest = await prisma.carInterest.upsert({
      where: {
        carId_email: {
          carId: data.carId,
          email: data.email,
        },
      },
      update: {
        phoneNumber: data.phoneNumber ?? null,
        notified: false,
      },
      create: {
        carId: data.carId,
        email: data.email,
        phoneNumber: data.phoneNumber ?? null,
        notified: false,
      },
      select: {
        id: true,
        carId: true,
        email: true,
        phoneNumber: true,
        notified: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        status: 201,
        message: "Interest registered successfully",
        data: interest,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating car interest:", error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
