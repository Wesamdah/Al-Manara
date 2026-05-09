import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { reviewCreateInputSchema } from "@/lib/validations/database";
import { generateEditToken, hashEditToken } from "@/lib/reviews/tokens";

export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        isVerified: true,
      },
      orderBy: {
        createdAt: "desc", // Show newest reviews first
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
    return NextResponse.json({ status: 200, data: reviews }, { status: 200 });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const bodyValidation = reviewCreateInputSchema.safeParse(body);

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

    //used this token to verify the review and allow editing without email verification
    //so we can show the review immediately after submission and allow the user to edit it for a short period of time without verifying their email
    const editToken = generateEditToken();
    const editTokenHash = hashEditToken(editToken);

    const review = await prisma.review.create({
      data: {
        email: data.email,
        username: data.username ?? null,
        rating: data.rating,
        comment: data.comment ?? null,
        editTokenHash,
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
      {
        status: 201,
        data: review,
        editToken,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
