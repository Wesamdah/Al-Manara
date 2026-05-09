import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { authenticateAndAuthorize } from "@/lib/auth/admin-auth";
import { carInterestUpdateInputSchema } from "@/lib/validations/database";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const auth = await authenticateAndAuthorize(request, ["admin"]);

    if (!auth.success) {
      return NextResponse.json(
        { message: auth.message },
        { status: auth.status },
      );
    }

    const { id } = await context.params;
    const body = await request.json();

    const bodyValidation = carInterestUpdateInputSchema.safeParse(body);

    if (!bodyValidation.success) {
      return NextResponse.json(
        {
          message: "Invalid request body",
          issues: bodyValidation.error.flatten(),
        },
        { status: 400 },
      );
    }

    const interest = await prisma.carInterest.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!interest) {
      return NextResponse.json(
        { message: "Interest not found" },
        { status: 404 },
      );
    }

    const updatedInterest = await prisma.carInterest.update({
      where: { id },
      data: {
        notified: body.notified,
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
        status: 200,
        data: updatedInterest,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating interest:", error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const auth = await authenticateAndAuthorize(request, ["admin"]);

    if (!auth.success) {
      return NextResponse.json(
        { message: auth.message },
        { status: auth.status },
      );
    }

    const { id } = await context.params;

    const interest = await prisma.carInterest.findUnique({
      where: { id },
      select: {
        id: true,
      },
    });

    if (!interest) {
      return NextResponse.json(
        { message: "Interest not found" },
        { status: 404 },
      );
    }

    await prisma.carInterest.delete({
      where: { id },
    });

    return NextResponse.json(
      {
        status: 200,
        message: "Interest deleted successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting interest:", error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
