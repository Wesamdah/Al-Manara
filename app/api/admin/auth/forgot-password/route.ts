import { generateOtp, getOtpExpiryDate, hashOtp } from "@/lib/auth/otp";
import { sendPasswordResetOtp } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { adminForgotPasswordInputSchema } from "@/lib/validations/database";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = adminForgotPasswordInputSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          message: "Invalid request body",
          issues: validation.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { email } = validation.data;

    const admin = await prisma.admin.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        isActive: true,
      },
    });

    if (!admin || !admin.isActive) {
      console.log(admin);
      return NextResponse.json(
        {
          status: 200,
          message:
            "this email is not registered in our system, or the account is inactive.",
        },
        { status: 200 },
      );
    }

    // Invalidate any existing OTPs for this admin
    // This ensures that only the most recent OTP can be used for password reset
    await prisma.passwordReset.updateMany({
      where: {
        adminId: admin.id,
        used: false,
      },
      data: {
        used: true,
      },
    });

    const otp = generateOtp();
    const hashedOtp = hashOtp(otp);

    await prisma.passwordReset.create({
      data: {
        adminId: admin.id,
        token: hashedOtp,
        expiresAt: getOtpExpiryDate(10),
        used: false,
      },
    });

    await sendPasswordResetOtp({
      to: admin.email,
      otp,
    });

    return NextResponse.json(
      {
        status: 200,
        message: "If this email exists, an OTP has been sent.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Forgot password error:", error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
