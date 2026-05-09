import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateAndAuthorize } from "@/lib/auth/admin-auth";
import { adminCreateInputSchema } from "@/lib/validations/database";
import bcrypt from "bcryptjs";

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateAndAuthorize(request, ["admin"]);

    if (!auth.success) {
      return NextResponse.json(
        { message: auth.message },
        { status: auth.status },
      );
    }

    const admins = await prisma.admin.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isPrimary: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        status: 200,
        data: admins,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching admins:", error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateAndAuthorize(request, ["admin"]);

    if (!auth.success) {
      return NextResponse.json(
        { message: auth.message },
        { status: auth.status },
      );
    }

    const body = await request.json();

    const bodyValidation = adminCreateInputSchema.safeParse(body);

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

    const existingAdmin = await prisma.admin.findUnique({
      where: {
        email: data.email,
      },
      select: {
        id: true,
      },
    });

    if (existingAdmin) {
      return NextResponse.json(
        { message: "Admin with this email already exists" },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(data.passwordHash, 10);

    if (auth.admin?.isPrimary) {
      const newAdmin = await prisma.admin.create({
        data: {
          email: data.email,
          passwordHash,
          fullName: data.fullName,
          role: data.role ?? "admin",
          isPrimary: data.isPrimary ?? false,
          isActive: data.isActive ?? true,
        },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          isPrimary: true,
          isActive: true,
          createdAt: true,
        },
      });

      return NextResponse.json(
        {
          status: 201,
          message: "Admin created successfully",
          data: newAdmin,
        },
        { status: 201 },
      );
    }

    return NextResponse.json(
      {
        message: "Only primary admins can create new admin accounts",
      },
      { status: 403 },
    );
  } catch (error) {
    console.error("Error creating admin:", error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
