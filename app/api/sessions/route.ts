import { auth } from "../../../auth";
import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
export async function POST(request: Request) {
  const user = await auth();
  if (!user?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { type, durationSeconds, startedAt, endedAt } = await request.json();
  if (!["POMODORO", "TIMER"].includes(type) || !Number.isInteger(durationSeconds) || durationSeconds < 1)
    return NextResponse.json({ error: "Invalid session" }, { status: 400 });
  const dbUser = await prisma.user.findUniqueOrThrow({ where: { email: user.user.email } });
  const session = await prisma.workSession.create({
    data: {
      userId: dbUser.id,
      type,
      durationSeconds,
      startedAt: new Date(startedAt),
      endedAt: new Date(endedAt),
    },
  });
  revalidateTag(`dashboard-${dbUser.email}`);
  return NextResponse.json(session);
}
