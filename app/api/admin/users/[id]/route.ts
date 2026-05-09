import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateAndAuthorize } from "@/lib/auth/admin-auth";
import {
  adminCreateInputSchema,
  adminUpdateInputSchema,
  adminUpdateStatusInputSchema,
} from "@/lib/validations/database";

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

    if (auth.admin?.id !== id) {
      return NextResponse.json(
        { message: "You can only update your own profile" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const bodyValidation = adminUpdateInputSchema.safeParse(body);

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

    const targetAdmin = await prisma.admin.findUnique({
      where: { id },
      select: {
        id: true,
        isActive: true,
      },
    });

    if (!targetAdmin || !targetAdmin.isActive) {
      return NextResponse.json(
        { message: "Admin not found or inactive" },
        { status: 404 },
      );
    }

    const updatedAdmin = await prisma.admin.update({
      where: { id },
      data: {
        ...(data.fullName !== undefined && { fullName: data.fullName }),
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
        message: "Admin updated successfully",
        data: updatedAdmin,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating admin:", error);

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

    const body = await request.json();
    const bodyValidation = adminUpdateStatusInputSchema.safeParse(body);

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

    const targetAdmin = await prisma.admin.findUnique({
      where: { id },
      select: {
        id: true,
        isPrimary: true,
        isActive: true,
      },
    });

    if (!targetAdmin) {
      return NextResponse.json({ message: "Admin not found" }, { status: 404 });
    }

    if (targetAdmin.isPrimary) {
      return NextResponse.json(
        { message: "Primary admin cannot be deleted or deactivated" },
        { status: 403 },
      );
    }

    if (auth.admin?.id === id) {
      return NextResponse.json(
        { message: "You cannot deactivate your own account" },
        { status: 403 },
      );
    }

    const deactivatedAdmin = await prisma.admin.update({
      where: { id },
      data: {
        isActive: data.isActive,
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
        message: "Admin deactivated successfully",
        data: deactivatedAdmin,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deactivating admin:", error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
