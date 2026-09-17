import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "../../../../lib/prisma";

function digest(value: string) {
    return createHash("sha256").update(value).digest("hex");
}

export async function POST(request: Request) {
    const body = await request.json().catch(() => ({}));
    const email = String(body.email || "").toLowerCase().trim();
    const resetToken = String(body.resetToken || "");
    const password = String(body.password || "");
    if (password.length < 8 || !resetToken) return NextResponse.json({ error: "Use a password of at least 8 characters." }, { status: 400 });

    const record = await prisma.passwordReset.findUnique({ where: { email } });
    if (!record || !record.verifiedAt || record.expiresAt < new Date() || record.resetTokenHash !== digest(resetToken)) {
        return NextResponse.json({ error: "This password reset is invalid or expired." }, { status: 400 });
    }
    await prisma.$transaction([
        prisma.user.update({ where: { email }, data: { passwordHash: await hash(password, 12) } }),
        prisma.passwordReset.delete({ where: { email } }),
    ]);
    return NextResponse.json({ ok: true });
}
