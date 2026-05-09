import { authenticateAndAuthorize } from "@/lib/auth/admin-auth";
import { prisma } from "@/lib/prisma";
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

    const reviews = await prisma.review.findMany({
      orderBy: {
        createdAt: "desc",
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
    console.error("Error fetching admin reviews:", error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
