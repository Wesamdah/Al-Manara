import { NextResponse } from "next/server";

export function successResponse<T>(
  status: number,
  data: T,
  message?: string,
) {
  return NextResponse.json(
    {
      status,
      message,
      data,
    },
    { status },
  );
}

export function errorResponse(
  status: number,
  message: string,
  issues?: unknown,
) {
  return NextResponse.json(
    {
      status,
      message,
      ...(issues !== undefined ? { issues } : {}),
    },
    { status },
  );
}
