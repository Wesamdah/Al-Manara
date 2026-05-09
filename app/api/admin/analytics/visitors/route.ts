import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateAndAuthorize } from "@/lib/auth/admin-auth";
import { request } from "https";

function getStartOfDay(date: Date) {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0); // Set time to the start of the day
  return newDate;
}

// This will give us the date that is 'days' days before today
// For example, if today is September 30 and we subtract 7 days, we will get September 23
function subtractDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days); // Subtract the specified number of days

  return getStartOfDay(date); // Return the start of that day
}

function formatDate(date: Date) {
  return date.toISOString().split("T")[0];
}

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateAndAuthorize(request, ["admin"]);

    if (!auth.success) {
      return NextResponse.json(
        { message: auth.message },
        { status: auth.status },
      );
    }

    const weeklyStartDate = subtractDays(6);
    const monthlyStartDate = subtractDays(29);

    const [
      totalVisitors,
      weeklyEvents,
      monthlyEvents,
      topViewedCars,
      totalCarViews,
      totalPageViews,
    ] = await Promise.all([
      prisma.visitorEvent.count(),

      prisma.visitorEvent.findMany({
        where: {
          createdAt: {
            gte: weeklyStartDate,
          },
        },
        select: {
          createdAt: true,
        },
      }),

      prisma.visitorEvent.findMany({
        where: {
          createdAt: {
            gte: monthlyStartDate,
          },
        },
        select: {
          createdAt: true,
        },
      }),

      prisma.visitorEvent.groupBy({
        by: ["carId"],
        where: {
          eventType: "car_view",
          carId: {
            not: null,
          },
        },
        _count: {
          carId: true,
        },
        orderBy: {
          _count: {
            carId: "desc",
          },
        },
        take: 5,
      }),

      prisma.visitorEvent.count({
        where: {
          eventType: "car_view",
        },
      }),

      prisma.visitorEvent.count({
        where: {
          eventType: "page_view",
        },
      }),
    ]);

    const weeklyVisitorsMap = new Map<string, number>(); // Map to store the count of visitors for each day in the last 7 days
    const monthlyVisitorsMap = new Map<string, number>(); // Map to store the count of visitors for each day in the last 30 days

    for (let i = 0; i < 7; i++) {
      const date = subtractDays(6 - i);
      weeklyVisitorsMap.set(formatDate(date), 0);
    }

    for (let i = 0; i < 30; i++) {
      const date = subtractDays(29 - i);
      monthlyVisitorsMap.set(formatDate(date), 0);
    }

    for (const event of weeklyEvents) {
      const key = formatDate(event.createdAt);
      weeklyVisitorsMap.set(key, (weeklyVisitorsMap.get(key) ?? 0) + 1);
    }

    for (const event of monthlyEvents) {
      const key = formatDate(event.createdAt);
      monthlyVisitorsMap.set(key, (monthlyVisitorsMap.get(key) ?? 0) + 1);
    }

    const carIds = topViewedCars
      .map((item) => item.carId)
      .filter((id): id is string => Boolean(id));

    const cars = await prisma.car.findMany({
      where: {
        id: {
          in: carIds,
        },
      },
      select: {
        id: true,
        name: true,
        model: true,
        year: true,
        brand: {
          select: {
            name: true,
          },
        },
        images: {
          where: {
            isPrimary: true,
          },
          select: {
            imageUrl: true,
          },
          take: 1,
        },
      },
    });

    const carsMap = new Map(cars.map((car) => [car.id, car]));

    const topCars = topViewedCars.map((item) => {
      const car = item.carId ? carsMap.get(item.carId) : null;

      return {
        carId: item.carId,
        views: item._count.carId,
        car: car
          ? {
              id: car.id,
              name: car.name,
              model: car.model,
              year: car.year,
              brand: car.brand.name,
              imageUrl: car.images[0]?.imageUrl ?? null,
            }
          : null,
      };
    });

    return NextResponse.json(
      {
        status: 200,
        data: {
          totalVisitors,
          totalPageViews,
          totalCarViews,

          weeklyVisitors: Array.from(weeklyVisitorsMap.entries()).map(
            ([date, count]) => ({
              date,
              count,
            }),
          ),

          monthlyVisitors: Array.from(monthlyVisitorsMap.entries()).map(
            ([date, count]) => ({
              date,
              count,
            }),
          ),

          topCars,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching visitor analytics:", error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
