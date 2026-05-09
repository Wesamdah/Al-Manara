import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { adminResetPasswordInputSchema } from "@/lib/validations/database";
import { hashOtp } from "@/lib/auth/otp";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = adminResetPasswordInputSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          message: "Invalid request body",
          issues: validation.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { email, otp, newPassword } = validation.data;

    const admin = await prisma.admin.findUnique({
      where: { email },
      select: {
        id: true,
        isActive: true,
      },
    });

    if (!admin || !admin.isActive) {
      return NextResponse.json(
        { message: "Invalid or expired OTP" },
        { status: 400 },
      );
    }

    const hashedOtp = hashOtp(otp);

    const passwordReset = await prisma.passwordReset.findFirst({
      where: {
        adminId: admin.id,
        token: hashedOtp,
        used: false,
        expiresAt: {
          gt: new Date(), // gt means the OTP must not be expired
        },
      },
      orderBy: {
        createdAt: "desc", // Get the most recent OTP
      },
    });

    if (!passwordReset) {
      return NextResponse.json(
        { message: "Invalid or expired OTP" },
        { status: 400 },
      );
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await prisma.$transaction([
      prisma.admin.update({
        where: { id: admin.id },
        data: {
          passwordHash: newPasswordHash,
        },
      }),

      prisma.passwordReset.update({
        where: { id: passwordReset.id },
        data: {
          used: true,
        },
      }),
    ]);

    return NextResponse.json(
      {
        status: 200,
        message: "Password reset successful",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Reset password error:", error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
