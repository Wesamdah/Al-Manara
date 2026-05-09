import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { authenticateAndAuthorize } from "@/lib/auth/admin-auth";
import { adminReviewUpdateInputSchema } from "@/lib/validations/database";
import { is } from "zod/locales";

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

    const bodyValidation = adminReviewUpdateInputSchema.safeParse(body);

    if (!bodyValidation.success) {
      return NextResponse.json(
        {
          message: "Invalid request body",
          issues: bodyValidation.error.flatten(),
        },
        { status: 400 },
      );
    }

    const review = await prisma.review.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!review) {
      return NextResponse.json(
        { message: "Review not found" },
        { status: 404 },
      );
    }

    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        isVerified: bodyValidation.data.isVerified,
      },
      select: {
        id: true,
        email: true,
        username: true,
        rating: true,
        comment: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      { status: 200, data: updatedReview },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating admin review:", error);
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

    const review = await prisma.review.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!review) {
      return NextResponse.json(
        { message: "Review not found" },
        { status: 404 },
      );
    }

    await prisma.review.delete({
      where: { id },
    });

    return NextResponse.json(
      {
        status: 200,
        message: "Review deleted successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting review:", error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
