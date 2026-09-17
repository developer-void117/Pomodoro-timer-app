import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../auth";
import { prisma } from "../../../lib/prisma";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const email = session.user.email;
  const year = Number(request.nextUrl.searchParams.get("year"));
  const month = Number(request.nextUrl.searchParams.get("month"));
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 0 || month > 11)
    return NextResponse.json({ error: "Invalid month" }, { status: 400 });
  const start = new Date(Date.UTC(year, month, 1));
  const end = new Date(Date.UTC(year, month + 1, 1));
  const sessions = await prisma.workSession.findMany({
    where: { user: { email }, startedAt: { gte: start, lt: end } },
    select: { id: true, durationSeconds: true, type: true, startedAt: true },
    orderBy: { startedAt: "asc" },
  });
  return NextResponse.json(sessions.map((item) => ({ ...item, startedAt: new Date(item.startedAt).toISOString() })));
}
