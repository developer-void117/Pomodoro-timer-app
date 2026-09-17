import { auth } from "../../../auth";
import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";
import { compare, hash } from "bcryptjs";
import { revalidateTag } from "next/cache";

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name, image, currentPassword, newPassword } = await request.json();
  const cleanName = String(name || "").trim();
  const cleanImage = String(image || "").trim();
  if (
    cleanName.length > 60 ||
    cleanImage.length > 750000 ||
    (cleanImage && !cleanImage.startsWith("data:image/") && !cleanImage.startsWith("https://"))
  )
    return NextResponse.json({ error: "Please use a valid name and a small image." }, { status: 400 });
  const existingUser = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!existingUser) return NextResponse.json({ error: "User not found" }, { status: 404 });
  const passwordChange = String(newPassword || "");
  if (passwordChange) {
    if (passwordChange.length < 8)
      return NextResponse.json(
        { error: "Your new password must be at least 8 characters." },
        { status: 400 },
      );
    if (!(await compare(String(currentPassword || ""), existingUser.passwordHash)))
      return NextResponse.json({ error: "Your current password is incorrect." }, { status: 400 });
  }
  const user = await prisma.user.update({
    where: { email: session.user.email },
    data: {
      name: cleanName || null,
      image: cleanImage || null,
      ...(passwordChange ? { passwordHash: await hash(passwordChange, 12) } : {}),
    },
    select: { name: true, image: true },
  });
  revalidateTag(`dashboard-${session.user.email}`);
  revalidateTag(`profile-${session.user.email}`);
  return NextResponse.json(user);
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await prisma.user.delete({ where: { email: session.user.email } });
  return NextResponse.json({ ok: true });
}
