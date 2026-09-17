import { unstable_cache } from "next/cache";
import { prisma } from "./prisma";

export function getCachedDashboardData(email: string) {
  return unstable_cache(
    async () =>
      prisma.user.findUnique({
        where: { email },
        select: {
          name: true,
          image: true,
          email: true,
          sessions: {
            where: { startedAt: { gte: new Date(Date.now() - 6 * 86400000) } },
            select: { durationSeconds: true, startedAt: true },
            orderBy: { startedAt: "asc" },
          },
        },
      }),
    ["dashboard", email],
    { revalidate: 60, tags: [`dashboard-${email}`] },
  )();
}

export function getCachedNavigationUser(email: string) {
  return unstable_cache(
    async () =>
      prisma.user.findUnique({ where: { email }, select: { name: true, image: true, email: true } }),
    ["navigation-user", email],
    { revalidate: 60, tags: [`profile-${email}`] },
  )();
}
