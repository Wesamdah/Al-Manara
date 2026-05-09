import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import { verifyAdminToken } from "./admin-token";
import { NextRequest } from "next/server";

export async function authenticateAndAuthorize(
  request: NextRequest,
  allowedRoles: string[] = ["admin"],
) {
  try {
    const token = request.cookies.get("admin_token")?.value;

    if (!token) {
      return {
        success: false,
        status: 401,
        message: "Unauthorized",
      };
    }

    const payload = verifyAdminToken(token);

    if (!allowedRoles.includes(payload.role)) {
      return {
        success: false,
        status: 403,
        message: "Forbidden",
      };
    }

    const admin = await prisma.admin.findUnique({
      where: {
        id: payload.id,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        isPrimary: true,
      },
    });

    if (!admin || !admin.isActive) {
      return {
        success: false,
        status: 401,
        message: "Admin account is inactive or not found",
      };
    }

    return {
      success: true,
      status: 200,
      admin,
    };
  } catch (error) {
    console.error("Authentication error:", error);
    return {
      success: false,
      status: 401,
      message: "Invalid or expired token",
    };
  }
}
