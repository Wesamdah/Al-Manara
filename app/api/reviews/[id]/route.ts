import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { reviewUpdateInputSchema } from "@/lib/validations/database";
import { hashEditToken } from "@/lib/reviews/tokens";
import { Qahiri } from "next/font/google";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const bodyValidation = reviewUpdateInputSchema.safeParse(body);

    if (!bodyValidation.success) {
      return NextResponse.json(
        {
          message: "Invalid request body",
          issues: bodyValidation.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { editToken, rating, comment } = bodyValidation.data;

    const review = await prisma.review.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        editTokenHash: true,
      },
    });

    if (!review) {
      return NextResponse.json(
        { message: "Review not found" },
        { status: 404 },
      );
    }
    if (!review.editTokenHash) {
      return NextResponse.json(
        { message: "This review cannot be edited" },
        { status: 403 },
      );
    }

    const incomingTokenHash = hashEditToken(editToken);

    if (incomingTokenHash !== review.editTokenHash) {
      return NextResponse.json(
        { message: "You are not allowed to edit this review" },
        { status: 403 },
      );
    }

    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        ...(rating !== undefined && { rating }),
        ...(comment !== undefined && { comment }),
        isVerified: false,
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
    console.error("Error updating review:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const { editToken } = body;

    const review = await prisma.review.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        editTokenHash: true,
      },
    });

    if (!review) {
      return NextResponse.json(
        { message: "Review not found" },
        { status: 404 },
      );
    }
    if (!review.editTokenHash) {
      return NextResponse.json(
        { message: "This review cannot be deleted" },
        { status: 403 },
      );
    }

    const incomingTokenHash = hashEditToken(editToken);

    if (incomingTokenHash !== review.editTokenHash) {
      return NextResponse.json(
        { message: "You are not allowed to delete this review" },
        { status: 403 },
      );
    }

    await prisma.review.delete({
      where: { id },
    });
    return NextResponse.json(
      { status: 200, message: "Review deleted successfully" },
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
