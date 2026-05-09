import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateAndAuthorize } from "@/lib/auth/admin-auth";
import { adminChangePasswordInputSchema } from "@/lib/validations/database";
import bcrypt from "bcryptjs";

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
        { message: "You can only change your own password" },
        { status: 403 },
      );
    }

    const body = await request.json();

    const bodyValidation = adminChangePasswordInputSchema.safeParse(body);

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

    if (data.newPassword !== data.confirmNewPassword) {
      return NextResponse.json(
        { message: "New password and confirm password do not match" },
        { status: 400 },
      );
    }

    if (data.oldPassword === data.newPassword) {
      return NextResponse.json(
        { message: "New password must be different from old password" },
        { status: 400 },
      );
    }

    const targetAdmin = await prisma.admin.findUnique({
      where: { id },
      select: {
        id: true,
        passwordHash: true,
        isActive: true,
      },
    });

    if (!targetAdmin || !targetAdmin.isActive) {
      return NextResponse.json(
        { message: "Admin not found or inactive" },
        { status: 404 },
      );
    }

    const isOldPasswordCorrect = await bcrypt.compare(
      data.oldPassword,
      targetAdmin.passwordHash,
    );

    if (!isOldPasswordCorrect) {
      return NextResponse.json(
        { message: "Current password is incorrect" },
        { status: 400 },
      );
    }

    const passwordHash = await bcrypt.hash(data.newPassword, 10);

    if (data?.newPassword !== data?.confirmNewPassword) {
      return NextResponse.json(
        { message: "New password and confirm password do not match" },
        { status: 400 },
      );
    }

    await prisma.admin.update({
      where: { id },
      data: {
        passwordHash,
      },
    });

    return NextResponse.json(
      { message: "Password changed successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("CHANGE_ADMIN_PASSWORD_ERROR", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
